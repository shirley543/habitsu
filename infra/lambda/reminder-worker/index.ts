/**
 * Lambda function: Reads off ReminderQueue SQS, and sends email notifications/ reminders via SES
 * Triggered by SQS Event Source for Lambda function
 */
import { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { DueGoalMessage } from '../reminder-types/reminder-types';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION
});

const FROM_EMAIL = process.env.FROM_EMAIL;
if (!FROM_EMAIL) {
  throw new Error('FROM_EMAIL environment variable is not set');
}

const createSendEmailCommand = (message: DueGoalMessage) => {
  // TODOs: Replace in-line native template strings with actual Cfn templates
  // e.g. `Time for your habit: {{goal_title}}`
  const reminderEmailSubject = `Time for your habit: ${message.goalTitle}`

  const reminderEmailTextBodyData = `
  Hi there,

  This is a quick reminder to complete your habit today:

  ${message.goalTitle}

  Log your completion here: https://app-placeholder-url.com

  --
  Settings: https://app-placeholder-url.com
  Unsubscribe: https://app-placeholder-url.com
  `;

  const reminderEmailHtmlBodyData = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Habit Reminder</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 600px;">
    
    <p>Hi there,</p>
    
    <p>This is a quick reminder to complete your habit today:</p>
    
    <p style="font-size: 18px; font-weight: 600; margin: 24px 0; padding-left: 12px; border-left: 2px solid #111111;">
      ${message.goalTitle}
    </p>
    
    <p>
      <a href="https://app-placeholder-url.com" style="color: #0066cc; text-decoration: underline; font-weight: 500;">
        Log your completion →
      </a>
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 40px 0 20px 0;">
    
    <p style="font-size: 12px; color: #666666; margin: 0;">
      You received this because you requested reminders for your goals.<br>
      <a href="https://app-placeholder-url.com" style="color: #666666;">Settings</a> · <a href="https://app-placeholder-url.com" style="color: #666666;">Unsubscribe</a>
    </p>

  </body>
  </html>
  `;

  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [message.userEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: reminderEmailHtmlBodyData,
        },
        Text: {
          Charset: "UTF-8",
          Data: reminderEmailTextBodyData,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: reminderEmailSubject,
      },
    },
    Source: FROM_EMAIL,
    ReplyToAddresses: [],
  });
};

export const handler = async (_event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: {
    itemIdentifier: string
  }[] = [];

  for (const record of _event.Records) {
    try {
      const message: DueGoalMessage = JSON.parse(record.body);

      // Send SES email
      const sendEmailCommand = createSendEmailCommand(message);
      await sesClient.send(sendEmailCommand);
    } catch (error) {
      console.error(`Failed processing message ${record.messageId}:`, error);
      batchItemFailures.push({
        itemIdentifier: record.messageId
      });
    }
  }

  return { batchItemFailures };
};
