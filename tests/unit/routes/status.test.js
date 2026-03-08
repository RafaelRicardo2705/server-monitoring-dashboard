/**
 * Unit Tests: Status Route
 * Tests for GET /api/status endpoint.
 */

const request = require('supertest');
const { app } = require('../../../src/server');

describe('GET /api/status', () => {

  it('should return 200 status code', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
  });

  it('should return success: true', async () => {
    const res = await request(app).get('/api/status');
    expect(res.body.success).toBe(true);
  });

  it('should return data object with required fields', async () => {
    const res = await request(app).get('/api/status');
    const { data } = res.body;

    expect(data).toHaveProperty('serverStatus');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('memoryUsage');
    expect(data).toHaveProperty('cpuLoad');
    expect(data).toHaveProperty('version');
  });

  it('should return correct data types', async () => {
    const res = await request(app).get('/api/status');
    const { data } = res.body;

    expect(typeof data.serverStatus).toBe('string');
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.cpuLoad).toBe('number');
    expect(typeof data.version).toBe('string');
  });

  it('should return memoryUsage with correct structure', async () => {
    const res = await request(app).get('/api/status');
    const { memoryUsage } = res.body.data;

    expect(typeof memoryUsage.used).toBe('number');
    expect(typeof memoryUsage.total).toBe('number');
    expect(typeof memoryUsage.percentage).toBe('number');
  });

  it('should compute memory percentage accurately', async () => {
    const res = await request(app).get('/api/status');
    const { memoryUsage } = res.body.data;

    const expectedPercentage = parseFloat(
      ((memoryUsage.used / memoryUsage.total) * 100).toFixed(1)
    );

    /* Allow small floating point deviation */
    expect(Math.abs(memoryUsage.percentage - expectedPercentage)).toBeLessThan(1);
  });

  it('should return Content-Type as application/json', async () => {
    const res = await request(app).get('/api/status');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
