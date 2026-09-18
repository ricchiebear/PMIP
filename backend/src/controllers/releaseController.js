const releaseService = require('../services/releaseService');

// Release collection
async function getReleases(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result = await releaseService.getReleases(
      page,
      limit
    );

    return res.status(200).json({
      status: 'success',
      data: result.releases,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

// Individual release
async function getReleaseById(req, res, next) {
  try {
    const { releaseId } = req.params;

    const release =
      await releaseService.getReleaseById(
        releaseId
      );

    if (!release) {
      const error = new Error(
        'The requested release could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: release
    });
  } catch (error) {
    return next(error);
  }
}

// Release tracks
async function getReleaseTracks(req, res, next) {
  try {
    const { releaseId } = req.params;

    const result =
      await releaseService.getReleaseTracks(
        releaseId
      );

    if (!result) {
      const error = new Error(
        'The requested release could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        release: result.release,
        tracks: result.tracks
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getReleases,
  getReleaseById,
  getReleaseTracks
};