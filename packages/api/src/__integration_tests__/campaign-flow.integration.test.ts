import request from 'supertest';
import app from '../app';
import db from '../db';

const TEST_USER = {
  email: 'tester@example.com',
  name: 'Test User',
  password: 'Password123!',
};

const RECIPIENTS = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
];

async function truncateTables(): Promise<void> {
  await db.raw(
    'TRUNCATE TABLE campaign_recipients, campaigns, recipients, users RESTART IDENTITY CASCADE'
  );
}

describe('Campaign flow (integration)', () => {
  let token: string;
  let campaignId: number;

  beforeAll(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('POST /auth/register — creates a user', async () => {
    const res = await request(app).post('/auth/register').send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: TEST_USER.email, name: TEST_USER.name });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('POST /auth/login — returns JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token as string;
  });

  it('POST /campaigns — creates a draft campaign with recipients', async () => {
    const res = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Welcome Campaign',
        subject: 'Hello from us',
        body: '<p>Welcome!</p>',
        recipients: RECIPIENTS,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Welcome Campaign',
      status: 'draft',
    });
    expect(res.body.recipients).toHaveLength(2);
    campaignId = res.body.id as number;
  });

  it('GET /campaigns/:id — returns the campaign', async () => {
    const res = await request(app)
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(campaignId);
    expect(res.body.status).toBe('draft');
  });

  it('GET /campaigns — lists campaigns with pagination', async () => {
    const res = await request(app)
      .get('/campaigns')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.campaigns).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 20, total: 1 });
  });

  it('POST /campaigns/:id/schedule — sets a future scheduled_at', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    const res = await request(app)
      .post(`/campaigns/${campaignId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduled_at: futureDate });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('scheduled');
    expect(res.body.scheduled_at).toBeTruthy();
  });

  it('POST /campaigns/:id/send — sends the campaign', async () => {
    const res = await request(app)
      .post(`/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sent');
  });

  it('POST /campaigns/:id/send — rejects double-send', async () => {
    const res = await request(app)
      .post(`/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('GET /campaigns/:id/stats — returns correct counts', async () => {
    const res = await request(app)
      .get(`/campaigns/${campaignId}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 2,
      sent: 2,
      failed: 0,
      opened: 0,
    });
  });

  it('PATCH /campaigns/:id — rejects edit on sent campaign', async () => {
    const res = await request(app)
      .patch(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Changed' });

    expect(res.status).toBe(409);
  });

  it('DELETE /campaigns/:id — rejects delete on sent campaign', async () => {
    const res = await request(app)
      .delete(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('GET /campaigns/:id — 404 for non-existent campaign', async () => {
    const res = await request(app)
      .get('/campaigns/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('GET /health — returns ok without auth', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
