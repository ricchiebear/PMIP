const countryRepository = require('../repositories/countryRepository');

// Country ID validation
function validateCountryId(countryId) {
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

// Country collection
async function getCountries(page = 1, limit = 20) {
  const pagination = validatePagination(page, limit);

  const offset =
    (pagination.page - 1) * pagination.limit;

  const [countries, totalItems] = await Promise.all([
    countryRepository.findAll(
      pagination.limit,
      offset
    ),
    countryRepository.countAll()
  ]);

  return {
    countries,
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

// Individual country
async function getCountryById(countryId) {
  const parsedCountryId =
    validateCountryId(countryId);

  return countryRepository.findById(
    parsedCountryId
  );
}

module.exports = {
  getCountries,
  getCountryById,
  validateCountryId,
  validatePagination
};