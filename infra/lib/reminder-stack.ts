import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as targets from 'aws-cdk-lib/aws-scheduler-targets';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

/**
 * Purpose of the stack is to send daily habit reminders to users
 * Each habit is configured with its own daily reminder time (and which days of the week it is for).
 * 
 * Setup structure:
 * - EventBridge Scheduler: triggers the reminder check on a recurring schedule
 * - reminder-finder Lambda: queries the DB for goals due now, publishes one SQS message per goal
 * - SQS: buffers jobs so failures are isolated (one failed email doesn't block the rest)
 * - reminder-worker Lambda: reads from SQS, sends a reminder email via SES per goal
 */

export interface ReminderStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dbInstance: rds.DatabaseInstance;
  appSecurityGroup: ec2.SecurityGroup;
}

export class ReminderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ReminderStackProps) {
    super(scope, id, props);

    // Reminder Queue SQS:
    // - Dead-letter queue: holds messages that failed processing maxReceiveCount times,
    //   so a permanently-broken message stops retrying forever and can be inspected separately
    // - CloudWatch alarm: triggered when DLQ contains a single visible message for even a single period
    //   Future work: have alarm actually trigger alert e.g. email, Slack message, etc
    const reminderDLQ = new sqs.Queue(this, 'ReminderDLQ')

    const reminderQueue = new sqs.Queue(this, 'ReminderQueue', {
      visibilityTimeout: cdk.Duration.seconds(30), // how long a received message is hidden from other consumers before it's retried
      deadLetterQueue: {
        queue: reminderDLQ,
        maxReceiveCount: 3, // after 3 failed attempts, move to DLQ instead of retrying forever
      }
    });

    reminderDLQ.metricApproximateNumberOfMessagesVisible().createAlarm(this, 'ReminderDLQAlarm',
      {
        threshold: 1,
        evaluationPeriods: 1,
      }
    )

    const databaseSecret = props.dbInstance.secret;
    if (!databaseSecret) {
      throw new Error('Database secret must be set to deploy ReminderStack');
    }
    const databaseUrl = `postgresql://${databaseSecret.secretValueFromJson('username')}:${databaseSecret.secretValueFromJson('password')}@${props.dbInstance.instanceEndpoint.hostname}:5432/habittracker`;
    // Currently using CloudFormation dynamic reference (assembled at deploy time, thus not rotation-safe)
    // Future work: use Runtime fetch (rotation-safe, but more config needed)

    // Reminder-Finder Lambda:
    // - Grant reminder-finder permission to send to SQS
    const reminderFinder = new lambda.NodejsFunction(this, 'ReminderFinder', {
      entry: path.join(__dirname, '../lambda/reminder-finder/index.ts'),
      handler: 'handler',
      environment: {
        DATABASE_URL: databaseUrl,
        QUEUE_URL: reminderQueue.queueUrl,
      },
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.appSecurityGroup],
    });
    reminderQueue.grantSendMessages(reminderFinder);

    // EventBridge schedule: fires every hour
    // Wire the schedule to the Lambda
    const schedule = new scheduler.Schedule(this, 'ReminderSchedule', {
      schedule: scheduler.ScheduleExpression.rate(cdk.Duration.hours(1)),
      target: new targets.LambdaInvoke(reminderFinder),
    });

    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('FROM_EMAIL environment variable must be set to deploy ReminderStack');
    }

    // Reminder-Worker Lambda:
    // - Grant reminder-worker permission to consume from SQS
    //   (gives it ReceiveMessage/ DeleteMessage/ GetQueueAttributes IAM permissions)
    // - Grant reminder-worker permission to send emails via SES
    // - Wire it to the queue as an SQS event source, so it's invoked per batch of messages
    const reminderWorker = new lambda.NodejsFunction(this, 'ReminderWorker', {
      entry: path.join(__dirname, '../lambda/reminder-worker/index.ts'),
      handler: 'handler',
      environment: {
        FROM_EMAIL: fromEmail,
      }
      // Note: no vpc/ vpcSubnets/ securityGroups, as it only touches
      // SQS/SES (never the private DB) thus no need to be VPC-attached
    });

    reminderQueue.grantConsumeMessages(reminderWorker);

    reminderWorker.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'] // TODOs #86: Scope to a specific verified identity ARN 
      // (format `arn:aws:ses:${this.region}:${this.account}:identity/${fromEmail}`),
      // once sending domain configured
    }))

    reminderWorker.addEventSource(new SqsEventSource(reminderQueue, {
      batchSize: 10, // max messages pulled from SQS per Lambda invocation
      reportBatchItemFailures: true, // Lets failed items retry without reprocessing the whole batch
    }))
  }
}
