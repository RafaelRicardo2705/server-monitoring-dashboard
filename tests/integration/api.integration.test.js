/**
 * Integration Tests: API
 * End-to-end API flow tests, static file serving, and error scenarios.
 */

const request = require('supertest');
const { app } = require('../../src/server');
const { resetLogs, initializeLogs } = require('../../src/services/monitorService');

describe('API Integration Tests', () => {

  beforeEach(() => {
    resetLogs();
    initializeLogs();
  });

  /* ─── End-to-End API Flow ─── */
  describe('End-to-end API flow', () => {

    it('should create a log and then retrieve it', async () => {
      /* Step 1: Create a log */
      const createRes = await request(app)
        .post('/api/logs')
        .send({ level: 'error', message: 'Integration test error', source: 'api' });

      expect(createRes.status).toBe(201);
      const createdId = createRes.body.data.id;

      /* Step 2: Retrieve logs and find the created one */
      const getRes = await request(app).get('/api/logs?level=error&limit=100');
      expect(getRes.status).toBe(200);

      const found = getRes.body.data.logs.find((log) => log.id === createdId);
      expect(found).toBeDefined();
      expect(found.message).toBe('Integration test error');
      expect(found.source).toBe('api');
    });

    it('should return status and logs independently', async () => {
      const [statusRes, logsRes] = await Promise.all([
        request(app).get('/api/status'),
        request(app).get('/api/logs')
      ]);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.data.serverStatus).toBe('online');

      expect(logsRes.status).toBe(200);
      expect(logsRes.body.success).toBe(true);
      expect(Array.isArray(logsRes.body.data.logs)).toBe(true);
    });

    it('should handle multiple sequential log creations', async () => {
      const levels = ['info', 'warn', 'error'];

      for (const level of levels) {
        const res = await request(app)
          .post('/api/logs')
          .send({ level, message: `Sequential ${level} log`, source: 'system' });

        expect(res.status).toBe(201);
        expect(res.body.data.level).toBe(level);
      }

      /* Verify all three were added */
      const getRes = await request(app).get('/api/logs?limit=100');
      const sequentialLogs = getRes.body.data.logs.filter(
        (log) => log.message.startsWith('Sequential')
      );
      expect(sequentialLogs).toHaveLength(3);
    });
  });

  /* ─── Static File Serving ─── */
  describe('Static file serving', () => {

    it('should serve index.html at root', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('Server Monitoring Dashboard');
    });

    it('should serve CSS files', async () => {
      const res = await request(app).get('/css/styles.css');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/css/);
    });

    it('should serve JavaScript files', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
    });
  });

  /* ─── Error Scenarios ─── */
  describe('Error scenarios', () => {

    it('should return 404 JSON for unknown API endpoints', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Resource not found');
    });

    it('should return 400 for POST /api/logs with empty body', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for POST /api/logs with invalid JSON', async () => {
      const res = await request(app)
        .post('/api/logs')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(res.status).toBe(400);
    });

    it('should handle GET /api/logs with invalid query parameters gracefully', async () => {
      const res = await request(app).get('/api/logs?limit=abc&level=invalid');
      expect(res.status).toBe(200);
      /* Invalid limit defaults to 10, invalid level returns all */
      expect(res.body.data.pagination.limit).toBe(10);
    });

    it('should return 404 for non-existent static file', async () => {
      const res = await request(app).get('/nonexistent.html');
      expect(res.status).toBe(404);
    });
  });

  /* ─── Content Type Verification ─── */
  describe('Content type verification', () => {

    it('should return JSON for all API endpoints', async () => {
      const endpoints = ['/api/status', '/api/logs'];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.headers['content-type']).toMatch(/json/);
      }
    });
  });
});
