/**
 * Lambda function: Queries DB for goals due for a reminder and publishes each to SQS.
 * Triggered by EventBridge Scheduler on a recurring schedule.
 */
import { Client as DbClient } from 'pg';
import { ScheduledEvent } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DueGoalMessage } from '../reminder-types/reminder-types';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION
});

const QUEUE_URL = process.env.QUEUE_URL;
if (!QUEUE_URL) {
  throw new Error('QUEUE_URL environment variable is not set')
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function getDbClient(): Promise<DbClient> {
  // TODOs #84: Currently env var (local PostgreSQL DB)
  // To swap this to a Secrets Manager fetch (for connecting to AWS RDS DB)
  const dbClient = new DbClient({ connectionString: DATABASE_URL });
  await dbClient.connect();
  return dbClient;
}

interface DueGoalRow {
  user_id: number;
  user_email: string;
  goal_id: number;
  goal_title: string;
}

async function findDueGoals(db: DbClient): Promise<DueGoalRow[]> {
  // Find relevant user goal info.
  // Intent is to get the following info:
  // - User ID, email + Goal title
  // Where goal reminder:
  // - is enabled
  // - current server day-of-week is one of the listed reminder weekdays
  // - current server hour is equal to the reminder hour
  // - and a goal entry does not exist for the entry date
  const { rows } = await db.query<DueGoalRow>(`
    SELECT u.id AS user_id, u.email AS user_email, g.id AS goal_id, g.title AS goal_title
    FROM "User" u
    JOIN "Goal" g ON g."userId" = u.id
    JOIN "GoalReminder" gr ON gr."goalId" = g.id
    WHERE gr.enabled = true
      AND EXTRACT(ISODOW FROM now())::int = ANY(gr.weekdays)
      AND EXTRACT(HOUR FROM gr.time::time) = EXTRACT(HOUR FROM now())
      AND NOT EXISTS (
        SELECT 1 FROM "GoalEntry" e
        WHERE e."goalId" = g.id
          AND e."entryDate"::date = now()::date
      )
  `);

  return rows;
}

export const handler = async (_event: ScheduledEvent) => {
  const db = await getDbClient();
  try {
    const goalRows = await findDueGoals(db);
    const goalMessages = goalRows.map((goal) => {
      const message: DueGoalMessage = {
        userId: goal.user_id,
        userEmail: goal.user_email,
        goalId: goal.goal_id,
        goalTitle: goal.goal_title,
      };
      return message;
    })

    // SendMessage/ SendMessageBatch to SQS, to add habit-reminder messages to queue
    const messagesPromises = goalMessages.map((message) => {
      return sqsClient.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(message)
      }))
    });

    await Promise.all(messagesPromises);

    return {
      dueCount: goalMessages.length,
      queuedAt: new Date().toISOString(),
      goalIds: goalMessages.map(message => message.goalId),
    };
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  } finally {
    await db.end();
  }
};
