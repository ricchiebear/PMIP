const express = require('express');
const streamingController = require('../controllers/streamingController');

const router = express.Router();

// Historical chart performance
router.get(
  '/chart-performance',
  streamingController.getChartPerformance
);

// Historical streaming observations
router.get(
  '/',
  streamingController.getStreamingObservations
);

module.exports = router;