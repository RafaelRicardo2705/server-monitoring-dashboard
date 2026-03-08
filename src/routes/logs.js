/**
 * Logs Route
 * Handles GET /api/logs and POST /api/logs endpoints.
 */

const express = require('express');
const router = express.Router();
const { getLogs, addLog } = require('../services/monitorService');

/**
 * GET /api/logs
 * Returns paginated and optionally filtered log entries.
 * Query params: ?limit=10&level=info&offset=0
 */
router.get('/', (_req, res, next) => {
  try {
    const { limit, level, offset } = _req.query;
    const data = getLogs({ limit, level, offset });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/logs
 * Creates a new log entry for simulation purposes.
 * Body: { level: "info"|"warn"|"error", message: "string", source: "user"|"system"|"api" }
 */
router.post('/', (req, res, next) => {
  try {
    const { level, message, source } = req.body;

    /* Validate required fields */
    if (!level || !message) {
      return res.status(400).json({
        success: false,
        error: 'Fields "level" and "message" are required.'
      });
    }

    /* Validate level value */
    const validLevels = ['info', 'warn', 'error'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        error: `Invalid level. Must be one of: ${validLevels.join(', ')}`
      });
    }

    /* Validate source if provided */
    const validSources = ['system', 'user', 'api'];
    if (source && !validSources.includes(source)) {
      return res.status(400).json({
        success: false,
        error: `Invalid source. Must be one of: ${validSources.join(', ')}`
      });
    }

    const newLog = addLog({ level, message, source });

    res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
