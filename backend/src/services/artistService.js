const artistRepository = require('../repositories/artistRepository');

// Artist ID validation
function validateArtistId(artistId) {
  const parsedArtistId = Number(artistId);

  if (!Number.isInteger(parsedArtistId) || parsedArtistId <= 0) {
    const error = new Error(
      'Artist ID must be a positive integer.'
    );

    error.code = 'INVALID_ARTIST_ID';
    error.statusCode = 400;

    throw error;
  }

  return parsedArtistId;
}

// Pagination validation
function validatePagination(page = 1, limit = 20) {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
    const error = new Error(
      'Page must be a positive integer.'
    );

    error.code = 'INVALID_PAGE';
    error.statusCode = 400;

    throw error;
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    const error = new Error(
      'Limit must be a positive integer.'
    );

    error.code = 'INVALID_LIMIT';
    error.statusCode = 400;

    throw error;
  }

  return {
    page: parsedPage,
    limit: Math.min(parsedLimit, 100)
  };
}

// Artist collection
async function getArtists(page = 1, limit = 20) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [artists, totalItems] = await Promise.all([
    artistRepository.findAll(
      pagination.limit,
      offset
    ),
    artistRepository.countAll()
  ]);

  const totalPages = Math.ceil(
    totalItems / pagination.limit
  );

  return {
    artists,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages
    }
  };
}

// Individual artist
async function getArtistById(artistId) {
  const parsedArtistId = validateArtistId(artistId);

  return artistRepository.findById(parsedArtistId);
}

// Artist tracks
async function getArtistTracks(artistId) {
  const parsedArtistId = validateArtistId(artistId);

  const artist = await artistRepository.findById(
    parsedArtistId
  );

  if (!artist) {
    return null;
  }

  const tracks =
    await artistRepository.findTracksByArtistId(
      parsedArtistId
    );

  return {
    artist,
    tracks
  };
}

// Artist search
async function searchArtists(query, limit = 20) {
  if (typeof query !== 'string') {
    const error = new Error(
      'Search query must be text.'
    );

    error.code = 'INVALID_SEARCH_QUERY';
    error.statusCode = 400;

    throw error;
  }

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    const error = new Error(
      'Search query cannot be empty.'
    );

    error.code = 'EMPTY_SEARCH_QUERY';
    error.statusCode = 400;

    throw error;
  }

  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    const error = new Error(
      'Limit must be a positive integer.'
    );

    error.code = 'INVALID_LIMIT';
    error.statusCode = 400;

    throw error;
  }

  const safeLimit = Math.min(parsedLimit, 50);

  return artistRepository.searchByName(
    trimmedQuery,
    safeLimit
  );
}

module.exports = {
  getArtists,
  getArtistById,
  getArtistTracks,
  searchArtists,
  validateArtistId,
  validatePagination
};