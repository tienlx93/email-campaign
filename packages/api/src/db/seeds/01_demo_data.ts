import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Truncate all tables in reverse FK order
  await knex.raw('TRUNCATE TABLE campaign_recipients, campaigns, recipients, users RESTART IDENTITY CASCADE');

  // 1. Insert demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const [user] = await knex('users')
    .insert({ email: 'demo@example.com', name: 'Demo User', password_hash: passwordHash })
    .returning('id');
  const userId = user.id;

  // 2. Insert 5 recipients
  const recipientRows = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
    { email: 'carol@example.com', name: 'Carol' },
    { email: 'dave@example.com', name: 'Dave' },
    { email: 'eve@example.com', name: 'Eve' },
  ];
  const insertedRecipients = await knex('recipients').insert(recipientRows).returning('id');
  const recipientIds = insertedRecipients.map((r: { id: number }) => r.id);

  // 3. Insert 3 campaigns
  const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const [camp1] = await knex('campaigns')
    .insert({ name: 'Welcome Series', subject: 'Welcome!', body: '<p>Hello!</p>', status: 'draft', created_by: userId })
    .returning('id');
  const [camp2] = await knex('campaigns')
    .insert({ name: 'Newsletter April', subject: 'April Update', body: '<p>Monthly update.</p>', status: 'scheduled', scheduled_at: scheduledAt, created_by: userId })
    .returning('id');
  const [camp3] = await knex('campaigns')
    .insert({ name: 'Product Launch', subject: 'Big news!', body: '<p>We launched!</p>', status: 'sent', created_by: userId })
    .returning('id');

  const now = new Date().toISOString();

  // 4. Link recipients to campaigns
  // Campaign 1 (draft): all pending
  await knex('campaign_recipients').insert(
    recipientIds.map((rid: number) => ({ campaign_id: camp1.id, recipient_id: rid, status: 'pending' }))
  );

  // Campaign 2 (scheduled): all pending
  await knex('campaign_recipients').insert(
    recipientIds.map((rid: number) => ({ campaign_id: camp2.id, recipient_id: rid, status: 'pending' }))
  );

  // Campaign 3 (sent): all sent, first two with opened_at
  await knex('campaign_recipients').insert(
    recipientIds.map((rid: number, idx: number) => ({
      campaign_id: camp3.id,
      recipient_id: rid,
      status: 'sent',
      sent_at: now,
      opened_at: idx < 2 ? now : null,
    }))
  );
}
