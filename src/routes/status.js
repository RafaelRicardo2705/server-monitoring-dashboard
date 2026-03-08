/**
 * Status Route
 * Handles GET /api/status endpoint for system metrics.
 */

const express = require('express');
const router = express.Router();
const { getSystemStatus } = require('../services/monitorService');

/**
 * GET /api/status
 * Returns current server status including uptime, memory, CPU, and version.
 */
router.get('/', (_req, res, next) => {
  try {
    const data = getSystemStatus();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
