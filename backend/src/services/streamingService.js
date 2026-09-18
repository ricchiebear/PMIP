const streamingRepository = require('../repositories/streamingRepository');

// Optional track ID validation
function validateTrackId(trackId) {
  if (
    trackId === undefined ||
    trackId === null ||
    trackId === ''
  ) {
    return null;
  }

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

// Optional country ID validation
function validateCountryId(countryId) {
  if (
    countryId === undefined ||
    countryId === null ||
    countryId === ''
  ) {
    return null;
  }

  const parsedCountryId = Number(countryId);

  if (!Number.isInteger(parsedCountryId) || parsedCountryId <= 0) {
    const error = new Error(
      'Country ID must be a positive integer.'
    );

    error.code = 'INVALID_COUNTRY_ID';
    error.statusCode = 400;

    throw error;
  }

  return parsedCountryId;
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

// Historical streaming observations
async function getStreamingObservations(
  page = 1,
  limit = 20,
  trackId = null,
  countryId = null
) {
  const pagination = validatePagination(page, limit);

  const parsedTrackId = validateTrackId(trackId);
  const parsedCountryId = validateCountryId(countryId);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [observations, totalItems] = await Promise.all([
    streamingRepository.findAll(
      pagination.limit,
      offset,
      parsedTrackId,
      parsedCountryId
    ),
    streamingRepository.countAll(
      parsedTrackId,
      parsedCountryId
    )
  ]);

  const totalPages = Math.ceil(
    totalItems / pagination.limit
  );

  return {
    observations,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages
    }
  };
}

// Historical chart performance
async function getChartPerformance(
  page = 1,
  limit = 20,
  trackId = null,
  countryId = null
) {
  const pagination = validatePagination(page, limit);

  const parsedTrackId = validateTrackId(trackId);
  const parsedCountryId = validateCountryId(countryId);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [observations, totalItems] = await Promise.all([
    streamingRepository.findChartPerformance(
      pagination.limit,
      offset,
      parsedTrackId,
      parsedCountryId
    ),
    streamingRepository.countChartPerformance(
      parsedTrackId,
      parsedCountryId
    )
  ]);

  const totalPages = Math.ceil(
    totalItems / pagination.limit
  );

  return {
    observations,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages
    }
  };
}

module.exports = {
  getStreamingObservations,
  getChartPerformance,
  validateTrackId,
  validateCountryId,
  validatePagination
};