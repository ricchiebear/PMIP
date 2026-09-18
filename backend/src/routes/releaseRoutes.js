const express = require('express');
const releaseController = require('../controllers/releaseController');

const router = express.Router();

// Release collection routes
router.get('/', releaseController.getReleases);

// Individual release routes
router.get(
  '/:releaseId/tracks',
  releaseController.getReleaseTracks
);

router.get(
  '/:releaseId',
  releaseController.getReleaseById
);

module.exports = router;