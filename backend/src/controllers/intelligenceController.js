const intelligenceService = require('../services/intelligenceService');


// ============================================================
// Geographic intelligence
// ============================================================

async function getCountryGeographicIntelligence(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getCountryGeographicIntelligence(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getArtistGeographicIntelligence(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getArtistGeographicIntelligence(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getTrackGeographicIntelligence(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getTrackGeographicIntelligence(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Market intelligence
// ============================================================

async function getTrackMarketMovements(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getTrackMarketMovements(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getCountryMarketGrowth(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getCountryMarketGrowth(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getArtistMarketGrowth(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getArtistMarketGrowth(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getTrackMarketGrowth(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getTrackMarketGrowth(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Growth intelligence
// ============================================================

async function getArtistGrowthIntelligence(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getArtistGrowthIntelligence(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


// Get growth intelligence for one artist
async function getArtistGrowthIntelligenceByArtistId(
  req,
  res,
  next
) {
  try {
    const { artistId } = req.params;

    const result =
      await intelligenceService.getArtistGrowthIntelligenceByArtistId(
        artistId
      );

    if (!result) {
      const error = new Error(
        'No artist growth intelligence result was found for this artist in the latest market-growth intelligence run.'
      );

      error.code = 'INTELLIGENCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
}


async function getTrackGrowthIntelligence(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getTrackGrowthIntelligence(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Momentum intelligence
// ============================================================

async function getArtistMomentumResults(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getArtistMomentumResults(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getArtistMomentumResultByArtistId(
  req,
  res,
  next
) {
  try {
    const { artistId } = req.params;

    const result =
      await intelligenceService.getArtistMomentumResultByArtistId(
        artistId
      );

    if (!result) {
      const error = new Error(
        'No artist momentum result was found for this artist in the latest artist momentum intelligence run.'
      );

      error.code = 'INTELLIGENCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Forecasting intelligence
// ============================================================

async function getTrackForecastResults(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getTrackForecastResults(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getTrackForecastResultByTrackId(
  req,
  res,
  next
) {
  try {
    const { trackId } = req.params;

    const result =
      await intelligenceService.getTrackForecastResultByTrackId(
        trackId
      );

    if (!result) {
      const error = new Error(
        'No track forecasting result was found for this track in the latest forecasting intelligence run.'
      );

      error.code = 'INTELLIGENCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Streaming anomaly intelligence
// ============================================================

async function getTrackAnomalyResults(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const finalOnly =
      req.query.finalOnly === undefined
        ? true
        : req.query.finalOnly;

    const result =
      await intelligenceService.getTrackAnomalyResults(
        page,
        limit,
        finalOnly
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      filters: result.filters,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


async function getArtistAnomalySummaries(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await intelligenceService.getArtistAnomalySummaries(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.results,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  getCountryGeographicIntelligence,
  getArtistGeographicIntelligence,
  getTrackGeographicIntelligence,

  getTrackMarketMovements,
  getCountryMarketGrowth,
  getArtistMarketGrowth,
  getTrackMarketGrowth,

  getArtistGrowthIntelligence,
  getArtistGrowthIntelligenceByArtistId,
  getTrackGrowthIntelligence,

  getArtistMomentumResults,
  getArtistMomentumResultByArtistId,

  getTrackForecastResults,
  getTrackForecastResultByTrackId,

  getTrackAnomalyResults,
  getArtistAnomalySummaries
};