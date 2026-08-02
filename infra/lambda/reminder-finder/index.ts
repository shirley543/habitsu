/**
 * Queries DB for goals due for a reminder and publishes each to SQS.
 * Triggered by EventBridge Scheduler on a recurring schedule.
 */
import { Client } from 'pg';
import { ScheduledEvent } from 'aws-lambda';

async function getDbClient(): Promise<Client> {
  // TODOs #84: Currently env var (local PostgreSQL DB)
  // To swap this to a Secrets Manager fetch (for connecting to AWS RDS DB)
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

async function findDueGoals(db: Client) {
  // Find relevant user goal info.
  // Intent is to get the following info:
  // - User ID, email + Goal title
  // Where goal reminder:
  // - is enabled
  // - current server day-of-week is one of the listed reminder weekdays
  // - current server hour is equal to the reminder hour
  // - and a goal entry does not exist for the entry date
  const { rows } = await db.query(`
    SELECT u.id, u.email, g.title AS goal_title
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
    const dueGoals = await findDueGoals(db);
    // TODOs #84: add SendMessageBatch to SQS, to add habit-reminder messages to queue
    return { dueCount: dueGoals.length };
  } finally {
    await db.end();
  }
};
