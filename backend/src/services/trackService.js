const trackRepository = require('../repositories/trackRepository');

// Track ID validation
function validateTrackId(trackId) {
  const parsedTrackId = Number(trackId);

  if (!Number.isInteger(parsedTrackId) || parsedTrackId <= 0) {
    const error = new Error(
      'Track ID must be a positive integer.'
    );

    error.code = 'INVALID_TRACK_ID';
    error.statusCode = 400;

    throw error;
  }

  return parsedTrackId;
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

// Track collection
async function getTracks(page = 1, limit = 20) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [tracks, totalItems] = await Promise.all([
    trackRepository.findAll(
      pagination.limit,
      offset
    ),
    trackRepository.countAll()
  ]);

  const totalPages = Math.ceil(
    totalItems / pagination.limit
  );

  return {
    tracks,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages
    }
  };
}

// Individual track
async function getTrackById(trackId) {
  const parsedTrackId = validateTrackId(trackId);

  return trackRepository.findById(parsedTrackId);
}

// Track search
async function searchTracks(query, limit = 20) {
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

  return trackRepository.searchByName(
    trimmedQuery,
    safeLimit
  );
}

module.exports = {
  getTracks,
  getTrackById,
  searchTracks,
  validateTrackId,
  validatePagination
};