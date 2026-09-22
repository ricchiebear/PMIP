const express = require('express');

const intelligenceController = require(
  '../controllers/intelligenceController'
);

const router = express.Router();


// ============================================================
// Geographic intelligence
// ============================================================

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


// ============================================================
// Market intelligence
// ============================================================

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


// ============================================================
// Growth intelligence
// ============================================================

// All artist growth results
router.get(
  '/growth/artists',
  intelligenceController.getArtistGrowthIntelligence
);

// One artist growth result
router.get(
  '/growth/artists/:artistId',
  intelligenceController.getArtistGrowthIntelligenceByArtistId
);

// All track growth results
router.get(
  '/growth/tracks',
  intelligenceController.getTrackGrowthIntelligence
);


// ============================================================
// Momentum intelligence
// ============================================================

// All artist momentum results
router.get(
  '/momentum/artists',
  intelligenceController.getArtistMomentumResults
);

// One artist momentum result
router.get(
  '/momentum/artists/:artistId',
  intelligenceController.getArtistMomentumResultByArtistId
);


// ============================================================
// Forecasting intelligence
// ============================================================

// All track forecasting results
router.get(
  '/forecasting/tracks',
  intelligenceController.getTrackForecastResults
);

// One track forecasting result
router.get(
  '/forecasting/tracks/:trackId',
  intelligenceController.getTrackForecastResultByTrackId
);


// ============================================================
// Streaming anomaly intelligence
// ============================================================

// Track anomaly results
router.get(
  '/anomalies/tracks',
  intelligenceController.getTrackAnomalyResults
);

// Artist anomaly summaries
router.get(
  '/anomalies/artists',
  intelligenceController.getArtistAnomalySummaries
);


// ============================================================
// Export router
// ============================================================

module.exports = router;