const streamingService = require('../services/streamingService');

// Historical streaming observations
async function getStreamingObservations(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;
    const trackId = req.query.trackId ?? null;
    const countryId = req.query.countryId ?? null;

    const result =
      await streamingService.getStreamingObservations(
        page,
        limit,
        trackId,
        countryId
      );

    return res.status(200).json({
      status: 'success',
      data: result.observations,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

// Historical chart performance
async function getChartPerformance(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const trackId = req.query.trackId || null;
    const countryId = req.query.countryId || null;

    const result =
      await streamingService.getChartPerformance(
        page,
        limit,
        trackId,
        countryId
      );

    return res.status(200).json({
      status: 'success',
      data: result.observations,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStreamingObservations,
  getChartPerformance
};