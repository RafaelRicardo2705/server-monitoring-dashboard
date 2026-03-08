/**
 * Logger Utility
 * Provides structured logging with level-based methods.
 * Replaces direct console.log usage in production code.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = LOG_LEVELS[
  (process.env.LOG_LEVEL || 'info').toUpperCase()
] ?? LOG_LEVELS.INFO;

/**
 * Format a log message with timestamp and level
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - Log message
 * @returns {string} Formatted log string
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
  info: (message) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      console.log(formatMessage('INFO', message));
    }
  },

  warn: (message) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message));
    }
  },

  error: (message) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message));
    }
  },

  debug: (message) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage('DEBUG', message));
    }
  }
};

module.exports = { logger, LOG_LEVELS, formatMessage };
