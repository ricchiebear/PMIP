const express = require('express');
const releaseController = require('../controllers/releaseController');

const router = express.Router();


// ============================================================
// Release collection
// ============================================================

router.get(
  '/',
  releaseController.getReleases
);


// ============================================================
// Release tracks
// ============================================================

router.get(
  '/:releaseId/tracks',
  releaseController.getReleaseTracks
);


// ============================================================
// Release-performance intelligence
// ============================================================

router.get(
  '/:releaseId/performance',
  releaseController.getReleasePerformance
);


// ============================================================
// Individual release
// ============================================================

router.get(
  '/:releaseId',
  releaseController.getReleaseById
);


// ============================================================
// Export router
// ============================================================

module.exports = router;