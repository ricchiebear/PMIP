const searchService =
  require('../services/searchService');


// ============================================================
// Global search
// ============================================================

async function searchPlatform(req, res, next) {
  try {
    const query = req.query.q;
    const limit = req.query.limit ?? 5;


    const results =
      await searchService.searchPlatform(
        query,
        limit
      );


    return res.status(200).json({
      status: 'success',
      query,
      data: results
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  searchPlatform
};