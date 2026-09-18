const express = require('express');
const intelligenceController = require('../controllers/intelligenceController');

const router = express.Router();

// Geographic intelligence
router.get(
  '/geographic/countries',
  intelligenceController.getCountryGeographicIntelligence
);

router.get(
  '/geographic/artists',
  intelligenceController.getArtistGeographicIntelligence
);

router.get(
  '/geographic/tracks',
  intelligenceController.getTrackGeographicIntelligence
);

// Market intelligence
router.get(
  '/markets/movements',
  intelligenceController.getTrackMarketMovements
);

router.get(
  '/markets/countries',
  intelligenceController.getCountryMarketGrowth
);

router.get(
  '/markets/artists',
  intelligenceController.getArtistMarketGrowth
);

router.get(
  '/markets/tracks',
  intelligenceController.getTrackMarketGrowth
);

// Growth intelligence
router.get(
  '/growth/artists',
  intelligenceController.getArtistGrowthIntelligence
);

router.get(
  '/growth/tracks',
  intelligenceController.getTrackGrowthIntelligence
);

// Momentum intelligence
router.get(
  '/momentum/artists',
  intelligenceController.getArtistMomentumResults
);

router.get(
  '/momentum/artists/:artistId',
  intelligenceController.getArtistMomentumResultByArtistId
);

// Forecasting intelligence
router.get(
  '/forecasting/tracks',
  intelligenceController.getTrackForecastResults
);

router.get(
  '/forecasting/tracks/:trackId',
  intelligenceController.getTrackForecastResultByTrackId
);

// Streaming anomaly intelligence
router.get(
  '/anomalies/tracks',
  intelligenceController.getTrackAnomalyResults
);

router.get(
  '/anomalies/artists',
  intelligenceController.getArtistAnomalySummaries
);

module.exports = router;