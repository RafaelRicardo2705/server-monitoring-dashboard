/**
 * Unit Tests: Monitor Service
 * Tests for system status, log management, and dummy data generation.
 */

const {
  getSystemStatus,
  getLogs,
  addLog,
  generateDummyLogs,
  initializeLogs,
  resetLogs,
  getRawLogs
} = require('../../../src/services/monitorService');

describe('MonitorService', () => {

  beforeEach(() => {
    resetLogs();
  });

  /* ─── getSystemStatus() ─── */
  describe('getSystemStatus()', () => {
    it('should return correct structure', () => {
      const status = getSystemStatus();

      expect(status).toHaveProperty('serverStatus');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('timestamp');
      expect(status).toHaveProperty('memoryUsage');
      expect(status).toHaveProperty('cpuLoad');
      expect(status).toHaveProperty('version');
    });

    it('should return serverStatus as "online"', () => {
      const status = getSystemStatus();
      expect(status.serverStatus).toBe('online');
    });

    it('should return uptime as a number', () => {
      const status = getSystemStatus();
      expect(typeof status.uptime).toBe('number');
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return a valid ISO timestamp', () => {
      const status = getSystemStatus();
      const date = new Date(status.timestamp);
      expect(date.toISOString()).toBe(status.timestamp);
    });

    it('should return valid memory usage data', () => {
      const status = getSystemStatus();
      const { memoryUsage } = status;

      expect(typeof memoryUsage.used).toBe('number');
      expect(typeof memoryUsage.total).toBe('number');
      expect(typeof memoryUsage.percentage).toBe('number');
      expect(memoryUsage.used).toBeLessThanOrEqual(memoryUsage.total);
      expect(memoryUsage.percentage).toBeGreaterThanOrEqual(0);
      expect(memoryUsage.percentage).toBeLessThanOrEqual(100);
    });

    it('should return cpuLoad as a number between 0 and 1', () => {
      const status = getSystemStatus();
      expect(typeof status.cpuLoad).toBe('number');
      expect(status.cpuLoad).toBeGreaterThanOrEqual(0);
      expect(status.cpuLoad).toBeLessThanOrEqual(1);
    });

    it('should return version as "1.0.0"', () => {
      const status = getSystemStatus();
      expect(status.version).toBe('1.0.0');
    });
  });

  /* ─── generateDummyLogs() ─── */
  describe('generateDummyLogs()', () => {
    it('should generate the correct number of logs', () => {
      const logs = generateDummyLogs(50);
      expect(logs).toHaveLength(50);
    });

    it('should generate logs with correct structure', () => {
      const logs = generateDummyLogs(10);

      logs.forEach((log) => {
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('level');
        expect(log).toHaveProperty('message');
        expect(log).toHaveProperty('source');
      });
    });

    it('should generate logs with valid levels', () => {
      const logs = generateDummyLogs(100);
      const validLevels = ['info', 'warn', 'error'];

      logs.forEach((log) => {
        expect(validLevels).toContain(log.level);
      });
    });

    it('should generate logs with valid sources', () => {
      const logs = generateDummyLogs(100);
      const validSources = ['system', 'api', 'user'];

      logs.forEach((log) => {
        expect(validSources).toContain(log.source);
      });
    });

    it('should generate logs sorted by timestamp descending', () => {
      const logs = generateDummyLogs(20);

      for (let i = 0; i < logs.length - 1; i++) {
        expect(new Date(logs[i].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(logs[i + 1].timestamp).getTime());
      }
    });

    it('should generate logs within the last 7 days', () => {
      const logs = generateDummyLogs(50);
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      logs.forEach((log) => {
        const logTime = new Date(log.timestamp).getTime();
        expect(logTime).toBeGreaterThanOrEqual(sevenDaysAgo);
        expect(logTime).toBeLessThanOrEqual(now + 1000); // small tolerance
      });
    });

    it('should default to 50 logs when no count is provided', () => {
      const logs = generateDummyLogs();
      expect(logs).toHaveLength(50);
    });
  });

  /* ─── getLogs() ─── */
  describe('getLogs()', () => {
    beforeEach(() => {
      initializeLogs();
    });

    it('should return logs with pagination info', () => {
      const result = getLogs();

      expect(result).toHaveProperty('logs');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('offset');
    });

    it('should respect limit parameter', () => {
      const result = getLogs({ limit: 5 });
      expect(result.logs.length).toBeLessThanOrEqual(5);
      expect(result.pagination.limit).toBe(5);
    });

    it('should cap limit at 100', () => {
      const result = getLogs({ limit: 200 });
      expect(result.pagination.limit).toBe(100);
    });

    it('should default limit to 10', () => {
      const result = getLogs();
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter by level', () => {
      const result = getLogs({ level: 'error' });
      result.logs.forEach((log) => {
        expect(log.level).toBe('error');
      });
    });

    it('should ignore invalid level filter', () => {
      const allResult = getLogs({ limit: 100 });
      const invalidResult = getLogs({ level: 'invalid', limit: 100 });
      expect(invalidResult.total).toBe(allResult.total);
    });

    it('should handle offset parameter', () => {
      const result = getLogs({ offset: 5, limit: 5 });
      expect(result.pagination.offset).toBe(5);
    });
  });

  /* ─── addLog() ─── */
  describe('addLog()', () => {
    it('should add a new log entry', () => {
      const log = addLog({
        level: 'info',
        message: 'Test log message',
        source: 'user'
      });

      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('timestamp');
      expect(log.level).toBe('info');
      expect(log.message).toBe('Test log message');
      expect(log.source).toBe('user');
    });

    it('should insert new log at the beginning', () => {
      addLog({ level: 'info', message: 'First', source: 'user' });
      addLog({ level: 'warn', message: 'Second', source: 'user' });

      const raw = getRawLogs();
      expect(raw[0].message).toBe('Second');
      expect(raw[1].message).toBe('First');
    });

    it('should default source to "user" if not provided', () => {
      const log = addLog({ level: 'error', message: 'No source' });
      expect(log.source).toBe('user');
    });

    it('should generate a unique ID for each log', () => {
      const log1 = addLog({ level: 'info', message: 'Log 1', source: 'system' });
      const log2 = addLog({ level: 'info', message: 'Log 2', source: 'system' });
      expect(log1.id).not.toBe(log2.id);
    });
  });

  /* ─── initializeLogs() ─── */
  describe('initializeLogs()', () => {
    it('should populate logs with 50 entries', () => {
      initializeLogs();
      const raw = getRawLogs();
      expect(raw).toHaveLength(50);
    });
  });

  /* ─── resetLogs() ─── */
  describe('resetLogs()', () => {
    it('should clear all logs', () => {
      initializeLogs();
      resetLogs();
      const raw = getRawLogs();
      expect(raw).toHaveLength(0);
    });
  });
});
