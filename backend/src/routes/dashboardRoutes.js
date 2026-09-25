const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();


// ============================================================
// Dashboard summary
// ============================================================

router.get(
  '/summary',
  dashboardController.getDashboardSummary
);


// ============================================================
// Export router
// ============================================================

module.exports = router;