import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as targets from 'aws-cdk-lib/aws-scheduler-targets';

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

    // Reminder-Finder Lambda
    const reminderFinder = new lambda.NodejsFunction(this, 'ReminderFinder', {
      entry: path.join(__dirname, '../lambda/reminder-finder/index.ts'),
      handler: 'handler',
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        QUEUE_URL: reminderQueue.queueUrl,
      }
    });

    // Grant finder permission to send to SQS
    reminderQueue.grantSendMessages(reminderFinder);

    // EventBridge schedule: fires every minute
    // Wire the schedule to the Lambda
    const schedule = new scheduler.Schedule(this, 'ReminderSchedule', {
      schedule: scheduler.ScheduleExpression.rate(cdk.Duration.minutes(1)),
      target: new targets.LambdaInvoke(reminderFinder),
    })
  }
}
