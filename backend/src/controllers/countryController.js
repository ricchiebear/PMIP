const countryService = require('../services/countryService');

// Country collection
async function getCountries(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const result =
      await countryService.getCountries(
        page,
        limit
      );

    return res.status(200).json({
      status: 'success',
      data: result.countries,
      pagination: result.pagination
    });
  } catch (error) {
    return next(error);
  }
}

// Individual country
async function getCountryById(req, res, next) {
  try {
    const { countryId } = req.params;

    const country =
      await countryService.getCountryById(
        countryId
      );

    if (!country) {
      const error = new Error(
        'The requested country could not be found.'
      );

      error.code = 'RESOURCE_NOT_FOUND';
      error.statusCode = 404;

      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: country
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCountries,
  getCountryById
};