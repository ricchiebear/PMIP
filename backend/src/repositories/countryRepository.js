const db = require('../config/database');

// Country collection
async function findAll(limit = 20, offset = 0) {
  const [rows] = await db.query(
    `
      SELECT
        country_id,
        country_name,
        country_code
      FROM countries
      ORDER BY country_name ASC
      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

async function countAll() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM countries
    `
  );

  return Number(rows[0].total);
}

// Individual country
async function findById(countryId) {
  const [rows] = await db.query(
    `
      SELECT
        country_id,
        country_name,
        country_code
      FROM countries
      WHERE country_id = ?
      LIMIT 1
    `,
    [countryId]
  );

  return rows[0] || null;
}

module.exports = {
  findAll,
  countAll,
  findById
};