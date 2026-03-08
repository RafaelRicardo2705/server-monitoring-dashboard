/**
 * Server Entry Point
 * Express server with middleware, routes, error handling, and graceful shutdown.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { logger } = require('./utils/logger');
const { initializeLogs } = require('./services/monitorService');
const statusRouter = require('./routes/status');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

/* ─── Middleware Stack ─── */
app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ─── API Routes ─── */
app.use('/api/status', statusRouter);
app.use('/api/logs', logsRouter);

/* ─── 404 Handler ─── */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

/* ─── Global Error Handler ─── */
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

/* ─── Initialize dummy log data ─── */
initializeLogs();

/* ─── Start Server (only when run directly, not during tests) ─── */
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

/* ─── Graceful Shutdown ─── */
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    /* Force shutdown after 10 seconds */
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, gracefulShutdown };
