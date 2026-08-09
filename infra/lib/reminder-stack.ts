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
 * - reminder-worker Lambda: reads from SQS, sends a reminder email via SES per goal
 */
export class ReminderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reminder Queue SQS:
    // Dead-letter queue: holds messages that failed processing maxReceiveCount times,
    // so a permanently-broken message stops retrying forever and can be inspected separately
    const reminderDLQ = new sqs.Queue(this, 'ReminderDLQ')

    const reminderQueue = new sqs.Queue(this, 'ReminderQueue', {
      visibilityTimeout: cdk.Duration.seconds(30), // how long a received message is hidden from other consumers before it's retried
      deadLetterQueue: {
        queue: reminderDLQ,
        maxReceiveCount: 3, // after 3 failed attempts, move to DLQ instead of retrying forever
      }
    });
    // TODOs #84: currently nothing done if reminders are placed into dead-letter queue.
    // To update to e.g. have CloudWatch alarm on reminderDLQ's `ApproximateNumberOfMessagesVisible` or something else.

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable must be set to deploy ReminderStack');
    }

    // Reminder-Finder Lambda:
    // - Grant reminder-finder permission to send to SQS
    const reminderFinder = new lambda.NodejsFunction(this, 'ReminderFinder', {
      entry: path.join(__dirname, '../lambda/reminder-finder/index.ts'),
      handler: 'handler',
      environment: {
        DATABASE_URL: databaseUrl,
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
