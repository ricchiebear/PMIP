const releaseRepository = require('../repositories/releaseRepository');

// Release ID validation
function validateReleaseId(releaseId) {
  const parsedReleaseId = Number(releaseId);

  if (!Number.isInteger(parsedReleaseId) || parsedReleaseId <= 0) {
    const error = new Error(
      'Release ID must be a positive integer.'
    );

    error.code = 'INVALID_RELEASE_ID';
    error.statusCode = 400;

    throw error;
  }

  return parsedReleaseId;
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

// Release collection
async function getReleases(page = 1, limit = 20) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [releases, totalItems] = await Promise.all([
    releaseRepository.findAll(
      pagination.limit,
      offset
    ),
    releaseRepository.countAll()
  ]);

  const totalPages = Math.ceil(
    totalItems / pagination.limit
  );

  return {
    releases,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages
    }
  };
}

// Individual release
async function getReleaseById(releaseId) {
  const parsedReleaseId = validateReleaseId(releaseId);

  return releaseRepository.findById(parsedReleaseId);
}

// Release tracks
async function getReleaseTracks(releaseId) {
  const parsedReleaseId = validateReleaseId(releaseId);

  const release = await releaseRepository.findById(
    parsedReleaseId
  );

  if (!release) {
    return null;
  }

  const tracks =
    await releaseRepository.findTracksByReleaseId(
      parsedReleaseId
    );

  return {
    release,
    tracks
  };
}

module.exports = {
  getReleases,
  getReleaseById,
  getReleaseTracks,
  validateReleaseId,
  validatePagination
};