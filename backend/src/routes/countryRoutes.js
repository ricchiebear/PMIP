const express = require('express');
const countryController = require('../controllers/countryController');

const router = express.Router();

// Country collection routes
router.get('/', countryController.getCountries);

// Individual country routes
router.get(
  '/:countryId',
  countryController.getCountryById
);

module.exports = router;