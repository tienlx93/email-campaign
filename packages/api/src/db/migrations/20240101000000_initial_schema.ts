import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('recipients', table => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('name', 255).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('campaigns', table => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('subject', 500).notNullable();
    table.text('body').notNullable();
    table.string('status', 20).notNullable().defaultTo('draft')
      .checkIn(['draft', 'scheduled', 'sent']);
    table.timestamp('scheduled_at', { useTz: true }).nullable();
    table.integer('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('campaign_recipients', table => {
    table.integer('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
    table.integer('recipient_id').notNullable().references('id').inTable('recipients').onDelete('RESTRICT');
    table.timestamp('sent_at', { useTz: true }).nullable();
    table.timestamp('opened_at', { useTz: true }).nullable();
    table.string('status', 20).notNullable().defaultTo('pending')
      .checkIn(['pending', 'sent', 'failed']);
    table.primary(['campaign_id', 'recipient_id']);
  });

  // Indexes
  await knex.schema.alterTable('campaigns', table => {
    table.index('created_by');
    table.index('status');
    table.index('scheduled_at');
  });

  await knex.schema.alterTable('campaign_recipients', table => {
    table.index('campaign_id');
    table.index('status');
  });

  await knex.schema.alterTable('recipients', table => {
    table.index('email');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('campaign_recipients');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('recipients');
  await knex.schema.dropTableIfExists('users');
}
