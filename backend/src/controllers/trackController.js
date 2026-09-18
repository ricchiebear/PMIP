const trackService = require('../services/trackService');

// Track collection
async function getTracks(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result = await trackService.getTracks(page, limit);

    return res.status(200).json({
      status: 'success',
      data: result.tracks,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

// Individual track
async function getTrackById(req, res, next) {
  try {
    const { trackId } = req.params;

    const track = await trackService.getTrackById(trackId);

    if (!track) {
      const error = new Error(
        'The requested track could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: track
    });
  } catch (error) {
    return next(error);
  }
}

// Track search
async function searchTracks(req, res, next) {
  try {
    const query = req.query.query ?? 1;
    const limit = req.query.limit ?? 20;

    const results = await trackService.searchTracks(
      query,
      limit
    );

    return res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTracks,
  getTrackById,
  searchTracks
};