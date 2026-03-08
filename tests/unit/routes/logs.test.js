/**
 * Unit Tests: Logs Route
 * Tests for GET /api/logs and POST /api/logs endpoints.
 */

const request = require('supertest');
const { app } = require('../../../src/server');
const { resetLogs, initializeLogs } = require('../../../src/services/monitorService');

describe('Logs API', () => {

  beforeEach(() => {
    resetLogs();
    initializeLogs();
  });

  /* ─── GET /api/logs ─── */
  describe('GET /api/logs', () => {

    it('should return 200 status code', async () => {
      const res = await request(app).get('/api/logs');
      expect(res.status).toBe(200);
    });

    it('should return success: true with data object', async () => {
      const res = await request(app).get('/api/logs');
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return an array of logs', async () => {
      const res = await request(app).get('/api/logs');
      expect(Array.isArray(res.body.data.logs)).toBe(true);
    });

    it('should return pagination info', async () => {
      const res = await request(app).get('/api/logs');
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination).toHaveProperty('limit');
      expect(res.body.data.pagination).toHaveProperty('offset');
    });

    it('should return total count', async () => {
      const res = await request(app).get('/api/logs');
      expect(typeof res.body.data.total).toBe('number');
      expect(res.body.data.total).toBe(50);
    });

    it('should respect ?limit query parameter', async () => {
      const res = await request(app).get('/api/logs?limit=5');
      expect(res.body.data.logs.length).toBeLessThanOrEqual(5);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('should default limit to 10', async () => {
      const res = await request(app).get('/api/logs');
      expect(res.body.data.logs.length).toBeLessThanOrEqual(10);
      expect(res.body.data.pagination.limit).toBe(10);
    });

    it('should filter logs by ?level=error', async () => {
      const res = await request(app).get('/api/logs?level=error&limit=100');

      res.body.data.logs.forEach((log) => {
        expect(log.level).toBe('error');
      });
    });

    it('should filter logs by ?level=info', async () => {
      const res = await request(app).get('/api/logs?level=info&limit=100');

      res.body.data.logs.forEach((log) => {
        expect(log.level).toBe('info');
      });
    });

    it('should filter logs by ?level=warn', async () => {
      const res = await request(app).get('/api/logs?level=warn&limit=100');

      res.body.data.logs.forEach((log) => {
        expect(log.level).toBe('warn');
      });
    });

    it('should return log entries with correct structure', async () => {
      const res = await request(app).get('/api/logs?limit=1');
      const log = res.body.data.logs[0];

      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('level');
      expect(log).toHaveProperty('message');
      expect(log).toHaveProperty('source');
    });
  });

  /* ─── POST /api/logs ─── */
  describe('POST /api/logs', () => {

    it('should create a new log entry', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'info', message: 'Test message', source: 'user' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.level).toBe('info');
      expect(res.body.data.message).toBe('Test message');
      expect(res.body.data.source).toBe('user');
    });

    it('should assign a unique ID to the new log', async () => {
      const res1 = await request(app)
        .post('/api/logs')
        .send({ level: 'info', message: 'Log 1', source: 'user' });

      const res2 = await request(app)
        .post('/api/logs')
        .send({ level: 'warn', message: 'Log 2', source: 'system' });

      expect(res1.body.data.id).not.toBe(res2.body.data.id);
    });

    it('should return 400 when level is missing', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ message: 'No level' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'info' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid level value', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'critical', message: 'Invalid level' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid source value', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'info', message: 'Bad source', source: 'unknown' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should default source to "user" when not provided', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'error', message: 'No source specified' });

      expect(res.status).toBe(201);
      expect(res.body.data.source).toBe('user');
    });

    it('should include newly created log in subsequent GET', async () => {
      await request(app)
        .post('/api/logs')
        .send({ level: 'error', message: 'Find me later', source: 'api' });

      const res = await request(app).get('/api/logs?level=error&limit=100');
      const found = res.body.data.logs.find((l) => l.message === 'Find me later');
      expect(found).toBeDefined();
    });
  });
});
