const db = require('../config/database');

// Track collection
async function findAll(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        track_id,
        source_track_id,
        isrc,
        track_name,
        created_at,
        updated_at
      FROM tracks
      ORDER BY track_id ASC
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
      FROM tracks
    `
  );

  return Number(rows[0].total);
}

// Individual track
async function findById(trackId) {
  const [rows] = await db.query(
    `
      SELECT
        track_id,
        source_track_id,
        isrc,
        track_name,
        created_at,
        updated_at
      FROM tracks
      WHERE track_id = ?
      LIMIT 1
    `,
    [trackId]
  );

  return rows[0] || null;
}

// Track search
async function searchByName(query, limit = 20) {
  const searchPattern = `%${query}%`;

  const [rows] = await db.query(
    `
      SELECT
        track_id,
        source_track_id,
        isrc,
        track_name,
        created_at,
        updated_at
      FROM tracks
      WHERE track_name LIKE ?
      ORDER BY track_name ASC
      LIMIT ?
    `,
    [searchPattern, limit]
  );

  return rows;
}

module.exports = {
  findAll,
  countAll,
  findById,
  searchByName
};