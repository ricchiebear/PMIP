const db = require('../config/database');

// Build optional streaming filters
function buildFilters(trackId = null, countryId = null) {
  const conditions = [];
  const params = [];

  if (trackId !== null) {
    conditions.push('so.track_id = ?');
    params.push(trackId);
  }

  if (countryId !== null) {
    conditions.push('so.country_id = ?');
    params.push(countryId);
  }

  return {
    conditions,
    params
  };
}

// Historical streaming observations
async function findAll(
  limit,
  offset,
  trackId = null,
  countryId = null
) {
  let query = `
    SELECT
      so.observation_id,
      so.track_id,
      t.track_name,
      so.country_id,
      c.country_name,
      c.country_code,
      so.observation_date,
      so.streams,
      so.chart_position
    FROM streaming_observations AS so
    INNER JOIN tracks AS t
      ON so.track_id = t.track_id
    INNER JOIN countries AS c
      ON so.country_id = c.country_id
  `;

  const { conditions, params } = buildFilters(
    trackId,
    countryId
  );

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(' AND ')}
    `;
  }

  query += `
    ORDER BY so.observation_date DESC, so.observation_id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [rows] = await db.query(query, params);

  return rows;
}

async function countAll(
  trackId = null,
  countryId = null
) {
  let query = `
    SELECT COUNT(*) AS total
    FROM streaming_observations AS so
  `;

  const { conditions, params } = buildFilters(
    trackId,
    countryId
  );

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(' AND ')}
    `;
  }

  const [rows] = await db.query(query, params);

  return Number(rows[0].total);
}

// Historical chart performance
async function findChartPerformance(
  limit,
  offset,
  trackId = null,
  countryId = null
) {
  let query = `
    SELECT
      so.observation_id,
      so.track_id,
      t.track_name,
      so.country_id,
      c.country_name,
      c.country_code,
      so.observation_date,
      so.chart_position
    FROM streaming_observations AS so
    INNER JOIN tracks AS t
      ON so.track_id = t.track_id
    INNER JOIN countries AS c
      ON so.country_id = c.country_id
    WHERE so.chart_position IS NOT NULL
  `;

  const { conditions, params } = buildFilters(
    trackId,
    countryId
  );

  if (conditions.length > 0) {
    query += `
      AND ${conditions.join(' AND ')}
    `;
  }

  query += `
    ORDER BY so.observation_date DESC, so.observation_id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [rows] = await db.query(query, params);

  return rows;
}

async function countChartPerformance(
  trackId = null,
  countryId = null
) {
  let query = `
    SELECT COUNT(*) AS total
    FROM streaming_observations AS so
    WHERE so.chart_position IS NOT NULL
  `;

  const { conditions, params } = buildFilters(
    trackId,
    countryId
  );

  if (conditions.length > 0) {
    query += `
      AND ${conditions.join(' AND ')}
    `;
  }

  const [rows] = await db.query(query, params);

  return Number(rows[0].total);
}

module.exports = {
  findAll,
  countAll,
  findChartPerformance,
  countChartPerformance
};