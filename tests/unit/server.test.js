/**
 * Unit Tests: Server
 * Tests for server initialization, 404 handler, and graceful shutdown.
 */

const request = require('supertest');
const { app } = require('../../src/server');

describe('Server', () => {

  /* ─── Server Startup ─── */
  describe('Server initialization', () => {

    it('should export the express app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should respond to requests', async () => {
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
    });

    it('should serve static files (index.html)', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });

    it('should parse JSON request bodies', async () => {
      const res = await request(app)
        .post('/api/logs')
        .send({ level: 'info', message: 'JSON parsing test', source: 'user' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
    });
  });

  /* ─── 404 Handler ─── */
  describe('404 handler', () => {

    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });

    it('should return JSON error for unknown API routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Resource not found');
    });

    it('should return 404 for random paths', async () => {
      const res = await request(app).get('/random/path/that/does/not/exist');
      expect(res.status).toBe(404);
    });
  });

  /* ─── Graceful Shutdown ─── */
  describe('Graceful shutdown', () => {

    it('should export gracefulShutdown function', () => {
      const { gracefulShutdown } = require('../../src/server');
      expect(typeof gracefulShutdown).toBe('function');
    });
  });

  /* ─── CORS ─── */
  describe('CORS', () => {

    it('should include CORS headers', async () => {
      const res = await request(app).get('/api/status');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
