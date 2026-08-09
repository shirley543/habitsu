import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as targets from 'aws-cdk-lib/aws-scheduler-targets';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

/**
 * Purpose of the stack is to send daily habit reminders to users
 * Each habit is configured with its own daily reminder time (and which days of the week it is for).
 * 
 * Setup structure:
 * - EventBridge Scheduler: triggers the reminder check on a recurring schedule
 * - reminder-finder Lambda: queries the DB for goals due now, publishes one SQS message per goal
 * - SQS: buffers jobs so failures are isolated (one failed email doesn't block the rest)
 * - reminder-worker Lambda: reads from SQS, sends a reminder email via SES per goal (TODOs #84)
 */
export class ReminderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS queue
    const reminderQueue = new sqs.Queue(this, 'ReminderQueue', {
      visibilityTimeout: cdk.Duration.seconds(30)
    });

    // Reminder-Finder Lambda:
    // - Grant reminder-finder permission to send to SQS
    const reminderFinder = new lambda.NodejsFunction(this, 'ReminderFinder', {
      entry: path.join(__dirname, '../lambda/reminder-finder/index.ts'),
      handler: 'handler',
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        QUEUE_URL: reminderQueue.queueUrl,
      }
    });
    reminderQueue.grantSendMessages(reminderFinder);

    // EventBridge schedule: fires every hour
    // Wire the schedule to the Lambda
    const schedule = new scheduler.Schedule(this, 'ReminderSchedule', {
      schedule: scheduler.ScheduleExpression.rate(cdk.Duration.hours(1)),
      target: new targets.LambdaInvoke(reminderFinder),
    });

    // Reminder-Worker Lambda:
    // - Grant reminder-worker permission to consume from SQS
    //   (gives it ReceiveMessage/ DeleteMessage/ GetQueueAttributes IAM permissions)
    // - Grant reminder-worker permission to send emails via SES
    // - Wire it to the queue as an SQS event source, so it's invoked per batch of messages
    const reminderWorker = new lambda.NodejsFunction(this, 'ReminderWorker', {
      entry: path.join(__dirname, '../lambda/reminder-worker/index.ts'),
      handler: 'handler',
      environment: {
        FROM_EMAIL: process.env.FROM_EMAIL ?? '',
      }
    });

    reminderQueue.grantConsumeMessages(reminderWorker);

    reminderWorker.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'] // TODOs #84: Alternatively, scope to a specific verified identity ARN
    }))

    reminderWorker.addEventSource(new SqsEventSource(reminderQueue, {
      batchSize: 10,
      reportBatchItemFailures: true, // Lets failed items retry without reprocessing the whole batch
    }))
  }
}
