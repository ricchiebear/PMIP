const express = require('express');
const searchController =
  require('../controllers/searchController');

const router = express.Router();


// ============================================================
// Global search
// ============================================================

router.get(
  '/',
  searchController.searchPlatform
);


// ============================================================
// Export router
// ============================================================

module.exports = router;