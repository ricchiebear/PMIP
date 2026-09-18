const express = require('express');
const artistController = require('../controllers/artistController');

const router = express.Router();

// Artist collection routes
router.get('/', artistController.getArtists);
router.get('/search', artistController.searchArtists);

// Individual artist routes
router.get('/:artistId/tracks', artistController.getArtistTracks);
router.get('/:artistId', artistController.getArtistById);

module.exports = router;