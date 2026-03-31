import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add sent_at column to campaigns table
  await knex.schema.alterTable('campaigns', table => {
    table.timestamp('sent_at', { useTz: true }).nullable();
  });

  // Add indexes to support search on name and subject
  await knex.schema.alterTable('campaigns', table => {
    table.index('name');
    table.index('subject');
  });

  // Add index on campaign_recipients.sent_at for sent-time queries
  await knex.schema.alterTable('campaign_recipients', table => {
    table.index('sent_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('campaign_recipients', table => {
    table.dropIndex('sent_at');
  });

  await knex.schema.alterTable('campaigns', table => {
    table.dropIndex('subject');
    table.dropIndex('name');
    table.dropColumn('sent_at');
  });
}
