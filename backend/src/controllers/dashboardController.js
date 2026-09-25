const artistRepository = require('../repositories/artistRepository');
const trackRepository = require('../repositories/trackRepository');
const releaseRepository = require('../repositories/releaseRepository');
const countryRepository = require('../repositories/countryRepository');


// ============================================================
// Dashboard summary
// ============================================================

async function getDashboardSummary(req, res, next) {
  try {
    const [
      artists,
      tracks,
      releases,
      countries
    ] = await Promise.all([
      artistRepository.countAll(),
      trackRepository.countAll(),
      releaseRepository.countAll(),
      countryRepository.countAll()
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        artists,
        tracks,
        releases,
        countries
      }
    });
  } catch (error) {
    return next(error);
  }
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  getDashboardSummary
};