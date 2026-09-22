const intelligenceRepository = require('../repositories/intelligenceRepository');

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

// Geographic intelligence
async function getCountryGeographicIntelligence(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findCountryGeographicIntelligence(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countCountryGeographicIntelligence()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getArtistGeographicIntelligence(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findArtistGeographicIntelligence(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countArtistGeographicIntelligence()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getTrackGeographicIntelligence(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackGeographicIntelligence(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countTrackGeographicIntelligence()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

// Market intelligence
async function getTrackMarketMovements(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackMarketMovements(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countTrackMarketMovements()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getCountryMarketGrowth(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findCountryMarketGrowth(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countCountryMarketGrowth()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getArtistMarketGrowth(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findArtistMarketGrowth(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countArtistMarketGrowth()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getTrackMarketGrowth(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackMarketGrowth(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countTrackMarketGrowth()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

// Entity ID validation
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

// Anomaly filter validation
function validateFinalOnly(finalOnly = true) {
  if (
    finalOnly === true ||
    finalOnly === 'true' ||
    finalOnly === '1'
  ) {
    return true;
  }

  if (
    finalOnly === false ||
    finalOnly === 'false' ||
    finalOnly === '0'
  ) {
    return false;
  }

  const error = new Error(
    'finalOnly must be true or false.'
  );

  error.code = 'INVALID_FINAL_ONLY';
  error.statusCode = 400;

  throw error;
}

// Growth intelligence
async function getArtistGrowthIntelligence(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findArtistGrowthIntelligence(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countArtistGrowthIntelligence()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

// Get growth intelligence for one artist
async function getArtistGrowthIntelligenceByArtistId(artistId) {
  const parsedArtistId = validateArtistId(artistId);

  return intelligenceRepository
    .findArtistGrowthIntelligenceByArtistId(
      parsedArtistId
    );
}

async function getTrackGrowthIntelligence(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackGrowthIntelligence(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countTrackGrowthIntelligence()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

// Momentum intelligence
async function getArtistMomentumResults(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findArtistMomentumResults(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countArtistMomentumResults()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getArtistMomentumResultByArtistId(
  artistId
) {
  const parsedArtistId = validateArtistId(artistId);

  return intelligenceRepository
    .findArtistMomentumResultByArtistId(
      parsedArtistId
    );
}

// Forecasting intelligence
async function getTrackForecastResults(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackForecastResults(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countTrackForecastResults()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getTrackForecastResultByTrackId(
  trackId
) {
  const parsedTrackId = validateTrackId(trackId);

  return intelligenceRepository
    .findTrackForecastResultByTrackId(
      parsedTrackId
    );
}

// Streaming anomaly intelligence
async function getTrackAnomalyResults(
  page = 1,
  limit = 20,
  finalOnly = true
) {
  const pagination = validatePagination(page, limit);
  const safeFinalOnly = validateFinalOnly(finalOnly);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findTrackAnomalyResults(
      pagination.limit,
      offset,
      safeFinalOnly
    ),
    intelligenceRepository.countTrackAnomalyResults(
      safeFinalOnly
    )
  ]);

  return {
    results,
    filters: {
      finalOnly: safeFinalOnly
    },
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

async function getArtistAnomalySummaries(
  page = 1,
  limit = 20
) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [results, totalItems] = await Promise.all([
    intelligenceRepository.findArtistAnomalySummaries(
      pagination.limit,
      offset
    ),
    intelligenceRepository.countArtistAnomalySummaries()
  ]);

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(
        totalItems / pagination.limit
      )
    }
  };
}

module.exports = {
  getCountryGeographicIntelligence,
  getArtistGeographicIntelligence,
  getTrackGeographicIntelligence,

  getTrackMarketMovements,
  getCountryMarketGrowth,
  getArtistMarketGrowth,
  getTrackMarketGrowth,

  getArtistGrowthIntelligence,
  getTrackGrowthIntelligence,
  getArtistGrowthIntelligenceByArtistId,

  getArtistMomentumResults,
  getArtistMomentumResultByArtistId,

  getTrackForecastResults,
  getTrackForecastResultByTrackId,

  getTrackAnomalyResults,
  getArtistAnomalySummaries
};