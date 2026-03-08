/**
 * Monitor Service
 * Provides system monitoring data and in-memory log management.
 * Handles status metrics, log CRUD, and dummy data generation.
 */

const { v4: uuidv4 } = require('uuid');
const os = require('os');

/* ─── In-memory log storage ─── */
let logs = [];

/* ─── Constants for dummy data generation ─── */
const LOG_MESSAGES = {
  info: [
    'Server health check passed',
    'Database connection pool refreshed',
    'Cache cleared successfully',
    'Scheduled backup completed',
    'New user session started',
    'API rate limit reset',
    'Configuration reloaded',
    'SSL certificate verified',
    'Memory garbage collection completed',
    'Cron job executed successfully',
    'Service discovery update received',
    'Load balancer health check passed',
    'Static assets cache refreshed',
    'Email queue processed',
    'Webhook delivery confirmed'
  ],
  warn: [
    'High memory usage detected (>80%)',
    'API response time exceeded threshold',
    'Disk space running low (< 20%)',
    'Database connection pool nearing limit',
    'Rate limit threshold approaching',
    'Deprecated API endpoint accessed',
    'SSL certificate expiring in 30 days',
    'Slow database query detected (>2s)',
    'Retry attempt for failed request',
    'Unusual traffic pattern detected'
  ],
  error: [
    'Database connection timeout',
    'Failed to process payment transaction',
    'Authentication service unavailable',
    'File upload failed: storage limit exceeded',
    'Unhandled promise rejection caught',
    'External API returned 503 error',
    'Memory allocation failed',
    'Critical: disk write error',
    'Socket connection dropped unexpectedly',
    'Failed to send notification email'
  ]
};

const SOURCES = ['system', 'api', 'user'];

/**
 * Generate a random date within the last N days
 * @param {number} days - Number of days to look back
 * @returns {Date} Random date object
 */
const randomDateWithinDays = (days) => {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
};

/**
 * Pick a random element from an array
 * @param {Array} arr - Source array
 * @returns {*} Random element
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate dummy log entries with realistic distribution.
 * Distribution: 70% info, 20% warn, 10% error
 * Sources: 60% system, 30% api, 10% user
 * @param {number} count - Number of log entries to generate
 * @returns {Array} Generated log entries
 */
const generateDummyLogs = (count = 50) => {
  const generated = [];

  for (let i = 0; i < count; i++) {
    /* Determine level based on distribution: 70/20/10 */
    const rand = Math.random();
    let level;
    if (rand < 0.7) level = 'info';
    else if (rand < 0.9) level = 'warn';
    else level = 'error';

    /* Determine source based on distribution: 60/30/10 */
    const sourceRand = Math.random();
    let source;
    if (sourceRand < 0.6) source = 'system';
    else if (sourceRand < 0.9) source = 'api';
    else source = 'user';

    generated.push({
      id: uuidv4(),
      timestamp: randomDateWithinDays(7).toISOString(),
      level,
      message: pickRandom(LOG_MESSAGES[level]),
      source
    });
  }

  /* Sort by timestamp descending (newest first) */
  generated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return generated;
};

/**
 * Get current system status metrics
 * @returns {Object} System status data
 */
const getSystemStatus = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = parseFloat(((usedMemory / totalMemory) * 100).toFixed(1));

  /* Calculate average CPU load across all cores */
  const cpus = os.cpus();
  const cpuLoad = parseFloat(
    (
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (1 - idle / total);
      }, 0) / cpus.length
    ).toFixed(2)
  );

  return {
    serverStatus: 'online',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memoryUsage: {
      used: usedMemory,
      total: totalMemory,
      percentage: memoryPercentage
    },
    cpuLoad,
    version: '1.0.0'
  };
};

/**
 * Get filtered and paginated log entries
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum entries to return (default 10, max 100)
 * @param {number} options.offset - Number of entries to skip (default 0)
 * @param {string} options.level - Filter by level (info|warn|error)
 * @returns {Object} Paginated log result
 */
const getLogs = ({ limit = 10, offset = 0, level } = {}) => {
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  let filtered = [...logs];

  /* Apply level filter if provided */
  if (level && ['info', 'warn', 'error'].includes(level)) {
    filtered = filtered.filter((log) => log.level === level);
  }

  const total = filtered.length;
  const paginatedLogs = filtered.slice(parsedOffset, parsedOffset + parsedLimit);

  return {
    logs: paginatedLogs,
    total,
    pagination: {
      limit: parsedLimit,
      offset: parsedOffset
    }
  };
};

/**
 * Add a new log entry
 * @param {Object} entry - Log entry data
 * @param {string} entry.level - Log level (info|warn|error)
 * @param {string} entry.message - Log message
 * @param {string} entry.source - Log source (system|user|api)
 * @returns {Object} Created log entry
 */
const addLog = ({ level, message, source }) => {
  const newLog = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    level,
    message,
    source: source || 'user'
  };

  /* Insert at the beginning to maintain newest-first order */
  logs.unshift(newLog);

  return newLog;
};

/**
 * Initialize logs with dummy data
 */
const initializeLogs = () => {
  logs = generateDummyLogs(50);
};

/**
 * Reset logs (used in testing)
 */
const resetLogs = () => {
  logs = [];
};

/**
 * Get raw logs array reference (used in testing)
 * @returns {Array} Current logs
 */
const getRawLogs = () => logs;

module.exports = {
  getSystemStatus,
  getLogs,
  addLog,
  generateDummyLogs,
  initializeLogs,
  resetLogs,
  getRawLogs
};
