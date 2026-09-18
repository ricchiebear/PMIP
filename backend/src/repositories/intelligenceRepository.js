const db = require('../config/database');

/**
 * Retrieve country geographic intelligence.
 *
 * Country information and intelligence-run metadata are joined
 * to make each result understandable and traceable.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Country geographic intelligence results.
 */
async function findCountryGeographicIntelligence(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        cgi.country_geo_result_id,
        cgi.country_id,
        c.country_name,
        c.country_code,

        cgi.observations,
        cgi.total_streams,
        cgi.median_streams,
        cgi.mean_streams,
        cgi.median_chart_position,

        cgi.top_10_rate_pct,
        cgi.top_50_rate_pct,
        cgi.number_one_rate_pct,

        cgi.streaming_strength_percentile,
        cgi.chart_strength_percentile,
        cgi.market_context_percentile,

        cgi.country_findings_index,
        cgi.country_findings_class,

        cgi.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        cgi.calculated_at

      FROM country_geographic_intelligence AS cgi

      INNER JOIN countries AS c
        ON cgi.country_id = c.country_id

      INNER JOIN intelligence_runs AS ir
        ON cgi.run_id = ir.run_id

      WHERE cgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )

      ORDER BY
        cgi.country_findings_index DESC,
        cgi.country_geo_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count country geographic intelligence results
 * belonging to the latest geographic intelligence run.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countCountryGeographicIntelligence() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM country_geographic_intelligence AS cgi
      WHERE cgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve artist geographic intelligence.
 *
 * Source-only artist records are preserved when no canonical
 * PMIP artist ID is available.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Artist geographic intelligence results.
 */
async function findArtistGeographicIntelligence(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        agi.artist_geo_result_id,

        agi.source_artist_label,
        agi.source_artist_key,
        agi.source_artist_identity_key,

        agi.artist_id,
        a.artist_name,

        agi.markets_reached,
        agi.international_reach_index,
        agi.international_reach_class,
        agi.market_penetration_index,
        agi.market_penetration_class,
        agi.stream_concentration_hhi,
        agi.effective_stream_markets,
        agi.market_dependency_class,
        agi.local_international_profile,
        agi.geographic_profile_index,
        agi.artist_geographic_profile,
        agi.artist_diversification_index,
        agi.artist_findings_index,
        agi.artist_findings_class,

        agi.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        agi.calculated_at

      FROM artist_geographic_intelligence AS agi

      LEFT JOIN artists AS a
        ON agi.artist_id = a.artist_id

      INNER JOIN intelligence_runs AS ir
        ON agi.run_id = ir.run_id

      WHERE agi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )

      ORDER BY
        agi.artist_findings_index DESC,
        agi.artist_geo_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count artist geographic intelligence results
 * belonging to the latest geographic intelligence run.
 *
 * Source-only records are included in the count.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countArtistGeographicIntelligence() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM artist_geographic_intelligence AS agi
      WHERE agi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve track geographic intelligence.
 *
 * A LEFT JOIN is used for tracks so that geographic intelligence
 * records are preserved even when no canonical PMIP track ID
 * is available.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Track geographic intelligence results.
 */
async function findTrackGeographicIntelligence(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        tgi.track_geo_result_id,

        tgi.source_track_id,

        tgi.track_id,
        t.track_name,

        tgi.geographic_reach_score,
        tgi.market_penetration_score,
        tgi.geographic_concentration_score,
        tgi.geographic_expansion_indicator,
        tgi.geographic_intelligence_score,
        tgi.geographic_balance_index,
        tgi.geographic_intelligence_class,
        tgi.geographic_performance_profile,
        tgi.strongest_geographic_dimension,
        tgi.weakest_geographic_dimension,

        tgi.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        tgi.calculated_at

      FROM track_geographic_intelligence AS tgi

      LEFT JOIN tracks AS t
        ON tgi.track_id = t.track_id

      INNER JOIN intelligence_runs AS ir
        ON tgi.run_id = ir.run_id

      WHERE tgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )

      ORDER BY
        tgi.geographic_intelligence_score DESC,
        tgi.track_geo_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count track geographic intelligence results
 * belonging to the latest geographic intelligence run.
 *
 * Records without a mapped PMIP track ID are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countTrackGeographicIntelligence() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM track_geographic_intelligence AS tgi
      WHERE tgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'geographic_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve track-market movement intelligence.
 *
 * LEFT JOINs preserve source-only track and country records
 * when canonical PMIP IDs are unavailable.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Track-market movement results.
 */
async function findTrackMarketMovements(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        tmm.movement_id,

        tmm.source_track_id,
        tmm.source_country,

        tmm.track_id,
        t.track_name,

        tmm.country_id,
        c.country_name,
        c.country_code,

        tmm.first_observation_date,
        tmm.latest_observation_date,

        tmm.market_entry_flag,
        tmm.expansion_flag,
        tmm.contraction_flag,
        tmm.cross_market_momentum,

        tmm.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        tmm.calculated_at

      FROM track_market_movements AS tmm

      LEFT JOIN tracks AS t
        ON tmm.track_id = t.track_id

      LEFT JOIN countries AS c
        ON tmm.country_id = c.country_id

      INNER JOIN intelligence_runs AS ir
        ON tmm.run_id = ir.run_id

      WHERE tmm.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        tmm.cross_market_momentum DESC,
        tmm.movement_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count track-market movement results belonging
 * to the latest market-growth intelligence run.
 *
 * Source-only track and country records are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countTrackMarketMovements() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM track_market_movements AS tmm
      WHERE tmm.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve country market-growth intelligence.
 *
 * A LEFT JOIN preserves market-growth records when no
 * canonical PMIP country ID is available.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Country market-growth intelligence results.
 */
async function findCountryMarketGrowth(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        cmg.country_growth_result_id,

        cmg.source_country,

        cmg.country_id,
        c.country_name,
        c.country_code,

        cmg.emerging_market_score,
        cmg.emerging_market_class,

        cmg.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        cmg.calculated_at

      FROM country_market_growth AS cmg

      LEFT JOIN countries AS c
        ON cmg.country_id = c.country_id

      INNER JOIN intelligence_runs AS ir
        ON cmg.run_id = ir.run_id

      WHERE cmg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        cmg.emerging_market_score DESC,
        cmg.country_growth_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count country market-growth intelligence results
 * belonging to the latest market-growth intelligence run.
 *
 * Records without a mapped PMIP country ID are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countCountryMarketGrowth() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM country_market_growth AS cmg
      WHERE cmg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve artist market-growth intelligence.
 *
 * LEFT JOINs preserve source-only artist and country records
 * when canonical PMIP IDs are unavailable.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Artist market-growth intelligence results.
 */
async function findArtistMarketGrowth(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        amg.artist_market_growth_id,

        amg.source_artist_label,
        amg.source_artist_key,
        amg.source_country,

        amg.artist_id,
        a.artist_name,

        amg.country_id,
        c.country_name,
        c.country_code,

        amg.market_growth_score,
        amg.market_growth_class,

        amg.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        amg.calculated_at

      FROM artist_market_growth AS amg

      LEFT JOIN artists AS a
        ON amg.artist_id = a.artist_id

      LEFT JOIN countries AS c
        ON amg.country_id = c.country_id

      INNER JOIN intelligence_runs AS ir
        ON amg.run_id = ir.run_id

      WHERE amg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        amg.market_growth_score DESC,
        amg.artist_market_growth_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count artist market-growth intelligence results
 * belonging to the latest market-growth intelligence run.
 *
 * Source-only artist and country records are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countArtistMarketGrowth() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM artist_market_growth AS amg
      WHERE amg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve track market-growth intelligence.
 *
 * LEFT JOINs preserve source-only track and country records
 * when canonical PMIP IDs are unavailable.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Track market-growth intelligence results.
 */
async function findTrackMarketGrowth(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        tmg.track_market_growth_id,

        tmg.source_track_id,
        tmg.source_country,

        tmg.track_id,
        t.track_name,

        tmg.country_id,
        c.country_name,
        c.country_code,

        tmg.market_growth_score,
        tmg.market_growth_class,

        tmg.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        tmg.calculated_at

      FROM track_market_growth AS tmg

      LEFT JOIN tracks AS t
        ON tmg.track_id = t.track_id

      LEFT JOIN countries AS c
        ON tmg.country_id = c.country_id

      INNER JOIN intelligence_runs AS ir
        ON tmg.run_id = ir.run_id

      WHERE tmg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        tmg.market_growth_score DESC,
        tmg.track_market_growth_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count track market-growth intelligence results
 * belonging to the latest market-growth intelligence run.
 *
 * Source-only track and country records are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countTrackMarketGrowth() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM track_market_growth AS tmg
      WHERE tmg.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve final artist growth intelligence.
 *
 * A LEFT JOIN preserves source-only artist intelligence
 * when no canonical PMIP artist ID is available.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Final artist growth intelligence results.
 */
async function findArtistGrowthIntelligence(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        agi.artist_growth_result_id,

        agi.source_artist_label,
        agi.source_artist_key,

        agi.artist_id,
        a.artist_name,

        agi.mean_market_growth_score,
        agi.maximum_artist_emerging_market_score,
        agi.growth_opportunity_score,
        agi.growth_opportunity_class,

        agi.pmip_growth_score,
        agi.pmip_growth_class,
        agi.pmip_growth_rank,
        agi.pmip_priority_class,

        agi.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        agi.calculated_at

      FROM artist_growth_intelligence AS agi

      LEFT JOIN artists AS a
        ON agi.artist_id = a.artist_id

      INNER JOIN intelligence_runs AS ir
        ON agi.run_id = ir.run_id

      WHERE agi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        agi.pmip_growth_rank ASC,
        agi.pmip_growth_score DESC,
        agi.artist_growth_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count final artist growth intelligence results
 * belonging to the latest market-growth intelligence run.
 *
 * Source-only artist records are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countArtistGrowthIntelligence() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM artist_growth_intelligence AS agi
      WHERE agi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve final track growth intelligence.
 *
 * A LEFT JOIN preserves source-only track intelligence
 * when no canonical PMIP track ID is available.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Final track growth intelligence results.
 */
async function findTrackGrowthIntelligence(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        tgi.track_growth_result_id,

        tgi.source_track_id,

        tgi.track_id,
        t.track_name,

        tgi.mean_market_growth_score,
        tgi.maximum_track_emerging_market_score,
        tgi.growth_opportunity_score,
        tgi.growth_opportunity_class,

        tgi.pmip_growth_score,
        tgi.pmip_growth_class,
        tgi.pmip_growth_rank,
        tgi.pmip_priority_class,

        tgi.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        tgi.calculated_at

      FROM track_growth_intelligence AS tgi

      LEFT JOIN tracks AS t
        ON tgi.track_id = t.track_id

      INNER JOIN intelligence_runs AS ir
        ON tgi.run_id = ir.run_id

      WHERE tgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )

      ORDER BY
        tgi.pmip_growth_rank ASC,
        tgi.pmip_growth_score DESC,
        tgi.track_growth_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count final track growth intelligence results
 * belonging to the latest market-growth intelligence run.
 *
 * Source-only track records are included.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countTrackGrowthIntelligence() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM track_growth_intelligence AS tgi
      WHERE tgi.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'market_growth_intelligence'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve artist momentum results.
 *
 * Results are retrieved from the latest
 * artist_momentum_scoring intelligence run.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Artist momentum results.
 */
async function findArtistMomentumResults(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        amr.momentum_result_id,

        amr.artist_id,
        a.artist_name,

        amr.final_momentum_score,
        amr.momentum_category,
        amr.shared_score_rank,
        amr.displayed_position,
        amr.main_neutral_driver,

        amr.relative_daily_growth_component,
        amr.listener_peak_ratio_component,
        amr.growth_contribution,
        amr.peak_position_contribution,

        amr.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        amr.calculated_at

      FROM artist_momentum_results AS amr

      INNER JOIN artists AS a
        ON amr.artist_id = a.artist_id

      INNER JOIN intelligence_runs AS ir
        ON amr.run_id = ir.run_id

      WHERE amr.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'artist_momentum_scoring'
      )

      ORDER BY
        amr.final_momentum_score DESC,
        amr.momentum_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count artist momentum results belonging to the latest
 * artist_momentum_scoring intelligence run.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countArtistMomentumResults() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM artist_momentum_results AS amr
      WHERE amr.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'artist_momentum_scoring'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve track forecasting results.
 *
 * Results are retrieved from the latest
 * artist_performance_forecasting intelligence run.
 *
 * @param {number} limit Maximum number of results to retrieve.
 * @param {number} offset Number of results to skip.
 * @returns {Promise<Array>} Track forecasting results.
 */
async function findTrackForecastResults(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        fr.forecast_result_id,

        fr.track_id,
        t.track_name,

        fr.predicted_spotify_streams,
        fr.actual_spotify_streams,
        fr.raw_predicted_spotify_streams,

        fr.prediction_error,
        fr.absolute_prediction_error,
        fr.prediction_was_clipped,

        fr.prediction_date,
        fr.feature_coverage,
        fr.high_forecast_review_flag,

        fr.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        fr.created_at

      FROM forecast_results AS fr

      INNER JOIN tracks AS t
        ON fr.track_id = t.track_id

      INNER JOIN intelligence_runs AS ir
        ON fr.run_id = ir.run_id

      WHERE fr.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'artist_performance_forecasting'
      )

      ORDER BY
        fr.predicted_spotify_streams DESC,
        fr.forecast_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

/**
 * Count track forecasting results belonging to the latest
 * artist_performance_forecasting intelligence run.
 *
 * @returns {Promise<number>} Total number of results.
 */
async function countTrackForecastResults() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM forecast_results AS fr
      WHERE fr.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'artist_performance_forecasting'
      )
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve the latest momentum result for a specific artist.
 *
 * The result must belong to the latest
 * artist_momentum_scoring intelligence run.
 *
 * @param {number} artistId PMIP artist ID.
 * @returns {Promise<Object|null>} Artist momentum result or null.
 */
async function findArtistMomentumResultByArtistId(artistId) {
  const [rows] = await db.query(
    `
      SELECT
        amr.momentum_result_id,

        amr.artist_id,
        a.artist_name,

        amr.final_momentum_score,
        amr.momentum_category,
        amr.shared_score_rank,
        amr.displayed_position,
        amr.main_neutral_driver,

        amr.relative_daily_growth_component,
        amr.listener_peak_ratio_component,
        amr.growth_contribution,
        amr.peak_position_contribution,

        amr.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        amr.calculated_at

      FROM artist_momentum_results AS amr

      INNER JOIN artists AS a
        ON amr.artist_id = a.artist_id

      INNER JOIN intelligence_runs AS ir
        ON amr.run_id = ir.run_id

      WHERE amr.artist_id = ?
        AND amr.run_id = (
          SELECT MAX(run_id)
          FROM intelligence_runs
          WHERE component_name = 'artist_momentum_scoring'
        )

      LIMIT 1
    `,
    [artistId]
  );

  return rows[0] || null;
}

/**
 * Retrieve the latest forecasting result for a specific track.
 *
 * The result must belong to the latest
 * artist_performance_forecasting intelligence run.
 *
 * @param {number} trackId PMIP track ID.
 * @returns {Promise<Object|null>} Track forecast result or null.
 */
async function findTrackForecastResultByTrackId(trackId) {
  const [rows] = await db.query(
    `
      SELECT
        fr.forecast_result_id,

        fr.track_id,
        t.track_name,

        fr.predicted_spotify_streams,
        fr.actual_spotify_streams,
        fr.raw_predicted_spotify_streams,

        fr.prediction_error,
        fr.absolute_prediction_error,
        fr.prediction_was_clipped,

        fr.prediction_date,
        fr.feature_coverage,
        fr.high_forecast_review_flag,

        fr.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        fr.created_at

      FROM forecast_results AS fr

      INNER JOIN tracks AS t
        ON fr.track_id = t.track_id

      INNER JOIN intelligence_runs AS ir
        ON fr.run_id = ir.run_id

      WHERE fr.track_id = ?
        AND fr.run_id = (
          SELECT MAX(run_id)
          FROM intelligence_runs
          WHERE component_name = 'artist_performance_forecasting'
        )

      LIMIT 1
    `,
    [trackId]
  );

  return rows[0] || null;
}

/**
 * Retrieve deduplicated track-level streaming anomaly results.
 *
 * One anomaly result is returned per observation_id.
 * When repeated source rows exist for the same observation,
 * the row with the smallest anomaly_result_id is retained.
 *
 * Results come from the latest streaming_anomaly_detection run.
 *
 * @param {number} limit Maximum number of results.
 * @param {number} offset Number of results to skip.
 * @param {boolean} finalOnly Whether to return only final PCA anomalies.
 * @returns {Promise<Array>} Track anomaly results.
 */
async function findTrackAnomalyResults(
  limit,
  offset,
  finalOnly = true
) {
  const finalCondition = finalOnly
    ? 'AND sar.is_final_pca_anomaly = 1'
    : '';

  const [rows] = await db.query(
    `
      SELECT
        sar.anomaly_result_id,

        sar.observation_id,

        so.track_id,
        t.track_name,

        so.country_id,
        so.observation_date,
        so.streams,
        so.chart_position,

        sar.pca_reconstruction_error,
        sar.anomaly_score_ratio,
        sar.anomaly_score_margin,
        sar.anomaly_score_excess_pct,

        sar.is_final_pca_anomaly,
        sar.anomaly_direction,
        sar.anomaly_severity,
        sar.severity_rank,
        sar.model_partition,

        sar.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        sar.calculated_at

      FROM streaming_anomaly_results AS sar

      INNER JOIN streaming_observations AS so
        ON sar.observation_id = so.observation_id

      INNER JOIN tracks AS t
        ON so.track_id = t.track_id

      INNER JOIN intelligence_runs AS ir
        ON sar.run_id = ir.run_id

      WHERE sar.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'streaming_anomaly_detection'
      )

      ${finalCondition}

      AND sar.anomaly_result_id = (
        SELECT MIN(sar2.anomaly_result_id)
        FROM streaming_anomaly_results AS sar2
        WHERE sar2.observation_id = sar.observation_id
          AND sar2.run_id = sar.run_id
          ${
            finalOnly
              ? 'AND sar2.is_final_pca_anomaly = 1'
              : ''
          }
      )

      ORDER BY
        sar.severity_rank DESC,
        sar.anomaly_score_ratio DESC,
        sar.anomaly_result_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}


/**
 * Count deduplicated track-level streaming anomaly results.
 *
 * @param {boolean} finalOnly Whether to count only final PCA anomalies.
 * @returns {Promise<number>} Total number of anomaly results.
 */
async function countTrackAnomalyResults(finalOnly = true) {
  const finalCondition = finalOnly
    ? 'AND sar.is_final_pca_anomaly = 1'
    : '';

  const [rows] = await db.query(
    `
      SELECT COUNT(DISTINCT sar.observation_id) AS total

      FROM streaming_anomaly_results AS sar

      WHERE sar.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'streaming_anomaly_detection'
      )

      ${finalCondition}
    `
  );

  return Number(rows[0].total);
}

/**
 * Retrieve deduplicated artist-level streaming anomaly summaries.
 *
 * Multiple source artist labels may map to the same canonical
 * PMIP artist. Those rows are combined so that each artist
 * appears only once in the API.
 *
 * Results come from the latest streaming_anomaly_detection run.
 *
 * @param {number} limit Maximum number of artists.
 * @param {number} offset Number of artists to skip.
 * @returns {Promise<Array>} Canonical artist anomaly summaries.
 */
async function findArtistAnomalySummaries(
  limit,
  offset
) {
  const [rows] = await db.query(
    `
      SELECT
        aas.artist_id,
        a.artist_name,

        GROUP_CONCAT(
          DISTINCT aas.source_artist_label
          ORDER BY aas.source_artist_label
          SEPARATOR ', '
        ) AS source_artist_labels,

        SUM(aas.total_observations) AS total_observations,
        SUM(aas.final_anomaly_count) AS final_anomaly_count,
        SUM(aas.high_priority_anomaly_count) AS high_priority_anomaly_count,
        SUM(aas.extreme_anomaly_count) AS extreme_anomaly_count,

        SUM(aas.positive_anomaly_count) AS positive_anomaly_count,
        SUM(aas.negative_anomaly_count) AS negative_anomaly_count,
        SUM(aas.flat_anomaly_count) AS flat_anomaly_count,

        CASE
          WHEN SUM(aas.total_observations) > 0
          THEN (
            SUM(aas.final_anomaly_count)
            / SUM(aas.total_observations)
          ) * 100
          ELSE 0
        END AS anomaly_rate_pct,

        CASE
          WHEN SUM(aas.final_anomaly_count) > 0
          THEN (
            SUM(aas.high_priority_anomaly_count)
            / SUM(aas.final_anomaly_count)
          ) * 100
          ELSE 0
        END AS high_priority_share_pct,

        MAX(aas.maximum_pca_score) AS maximum_pca_score,
        MAX(aas.maximum_anomaly_score_ratio) AS maximum_anomaly_score_ratio,

        MAX(aas.artist_review_score) AS artist_review_score,

        MAX(aas.latest_observation_date) AS latest_observation_date,

        aas.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at,

        MAX(aas.calculated_at) AS calculated_at

      FROM artist_anomaly_summaries AS aas

      INNER JOIN artists AS a
        ON aas.artist_id = a.artist_id

      INNER JOIN intelligence_runs AS ir
        ON aas.run_id = ir.run_id

      WHERE aas.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'streaming_anomaly_detection'
      )

      GROUP BY
        aas.artist_id,
        a.artist_name,
        aas.run_id,
        ir.component_name,
        ir.component_version,
        ir.generated_at

      ORDER BY
        artist_review_score DESC,
        final_anomaly_count DESC,
        aas.artist_id ASC

      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}


/**
 * Count unique canonical artists with anomaly summaries
 * in the latest streaming_anomaly_detection run.
 *
 * @returns {Promise<number>} Total number of unique artists.
 */
async function countArtistAnomalySummaries() {
  const [rows] = await db.query(
    `
      SELECT COUNT(DISTINCT aas.artist_id) AS total

      FROM artist_anomaly_summaries AS aas

      WHERE aas.run_id = (
        SELECT MAX(run_id)
        FROM intelligence_runs
        WHERE component_name = 'streaming_anomaly_detection'
      )
    `
  );

  return Number(rows[0].total);
}



module.exports = {
  findCountryGeographicIntelligence,
  countCountryGeographicIntelligence,

  findArtistGeographicIntelligence,
  countArtistGeographicIntelligence,

  findTrackGeographicIntelligence,
  countTrackGeographicIntelligence,

  findTrackMarketMovements,
  countTrackMarketMovements,

  findCountryMarketGrowth,
  countCountryMarketGrowth,

  findArtistMarketGrowth,
  countArtistMarketGrowth,

  findTrackMarketGrowth,
  countTrackMarketGrowth,

  findArtistGrowthIntelligence,
  countArtistGrowthIntelligence,

  findTrackGrowthIntelligence,
  countTrackGrowthIntelligence,

  findArtistMomentumResults,
  countArtistMomentumResults,
  findArtistMomentumResultByArtistId,

  findTrackForecastResults,
  countTrackForecastResults,
  findTrackForecastResultByTrackId,

  findTrackAnomalyResults,
  countTrackAnomalyResults,

  findArtistAnomalySummaries,
  countArtistAnomalySummaries
  
};