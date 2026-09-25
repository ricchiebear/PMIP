const searchRepository =
  require('../repositories/searchRepository');


// ============================================================
// Global search
// ============================================================

async function searchPlatform(query, limit = 5) {
  if (
    !query ||
    typeof query !== 'string' ||
    !query.trim()
  ) {
    const error = new Error(
      'A search query is required.'
    );

    error.code = 'INVALID_SEARCH_QUERY';
    error.statusCode = 400;

    throw error;
  }


  const parsedLimit = Number(limit);

  const safeLimit =
    Number.isInteger(parsedLimit) &&
    parsedLimit > 0 &&
    parsedLimit <= 20
      ? parsedLimit
      : 5;


  return searchRepository.searchAll(
    query.trim(),
    safeLimit
  );
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  searchPlatform
};