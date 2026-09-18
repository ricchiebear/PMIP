const express = require('express');
const trackController = require('../controllers/trackController');

const router = express.Router();

// Track collection routes
router.get('/', trackController.getTracks);
router.get('/search', trackController.searchTracks);

// Individual track routes
router.get('/:trackId', trackController.getTrackById);

module.exports = router;