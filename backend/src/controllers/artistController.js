const artistService = require('../services/artistService');

// Artist collection
async function getArtists(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result = await artistService.getArtists(page, limit);

    return res.status(200).json({
      status: 'success',
      data: result.artists,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

// Individual artist
async function getArtistById(req, res, next) {
  try {
    const { artistId } = req.params;

    const artist = await artistService.getArtistById(artistId);

    if (!artist) {
      const error = new Error(
        'The requested artist could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: artist
    });
  } catch (error) {
    return next(error);
  }
}

// Artist tracks
async function getArtistTracks(req, res, next) {
  try {
    const { artistId } = req.params;

    const result = await artistService.getArtistTracks(artistId);

    if (!result) {
      const error = new Error(
        'The requested artist could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        artist: result.artist,
        tracks: result.tracks
      }
    });
  } catch (error) {
    return next(error);
  }
}

// Artist search
async function searchArtists(req, res, next) {
  try {
    const query = req.query.query;
    const limit = req.query.limit ?? 20;

    const results = await artistService.searchArtists(
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
  getArtists,
  getArtistById,
  getArtistTracks,
  searchArtists
};