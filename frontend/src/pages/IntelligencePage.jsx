import { useState } from 'react';

import PageContainer from '../components/layout/PageContainer';
import ContentSection from '../components/common/ContentSection';
import SummaryCard from '../components/common/SummaryCard';

import CountryGeographicSection from '../components/intelligence/CountryGeographicSection';
import CountryMarketGrowthSection from '../components/intelligence/CountryMarketGrowthSection';
import ArtistGeographicSection from '../components/intelligence/ArtistGeographicSection';
import ArtistMarketGrowthSection from '../components/intelligence/ArtistMarketGrowthSection';
import MarketMovementsSection from '../components/intelligence/MarketMovementsSection';

import MomentumScoreChart from '../components/intelligence/MomentumScoreChart';
import ForecastComparisonChart from '../components/intelligence/ForecastComparisonChart';
import TrackAnomalyChart from '../components/intelligence/TrackAnomalyChart';
import ArtistAnomalyChart from '../components/intelligence/ArtistAnomalyChart';

import {
  getArtistMomentum,
  getTrackForecast,
  getTrackAnomalies,
  getArtistAnomalies
} from '../services/intelligenceService';


function IntelligencePage() {
  // ============================================================
  // Artist momentum
  // ============================================================

  const [artistId, setArtistId] = useState('2');
  const [momentum, setMomentum] = useState(null);
  const [momentumLoading, setMomentumLoading] = useState(false);
  const [momentumError, setMomentumError] = useState('');


  // ============================================================
  // Track forecasting
  // ============================================================

  const [trackId, setTrackId] = useState('119');
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');


  // ============================================================
  // Track anomalies
  // ============================================================

  const [trackAnomalies, setTrackAnomalies] = useState([]);

  const [
    trackAnomaliesLoading,
    setTrackAnomaliesLoading
  ] = useState(false);

  const [
    trackAnomaliesError,
    setTrackAnomaliesError
  ] = useState('');

  const [
    trackAnomaliesLoaded,
    setTrackAnomaliesLoaded
  ] = useState(false);


  // ============================================================
  // Artist anomalies
  // ============================================================

  const [artistAnomalies, setArtistAnomalies] = useState([]);

  const [
    artistAnomaliesLoading,
    setArtistAnomaliesLoading
  ] = useState(false);

  const [
    artistAnomaliesError,
    setArtistAnomaliesError
  ] = useState('');

  const [
    artistAnomaliesLoaded,
    setArtistAnomaliesLoaded
  ] = useState(false);


  // ============================================================
  // Load artist momentum
  // ============================================================

  async function handleLoadMomentum(event) {
    event.preventDefault();

    const parsedArtistId = Number(artistId);

    if (
      !Number.isInteger(parsedArtistId) ||
      parsedArtistId <= 0
    ) {
      setMomentum(null);

      setMomentumError(
        'Enter an artist ID using a whole number greater than 0.'
      );

      return;
    }

    try {
      setMomentumLoading(true);
      setMomentumError('');
      setMomentum(null);

      const result =
        await getArtistMomentum(
          parsedArtistId
        );

      setMomentum(
        result.data || null
      );

      if (!result.data) {
        setMomentumError(
          'Momentum intelligence is not available for this artist.'
        );
      }
    } catch (error) {
      setMomentum(null);

      setMomentumError(
        error.message ||
        'Unable to load momentum intelligence.'
      );
    } finally {
      setMomentumLoading(false);
    }
  }


  // ============================================================
  // Load track forecast
  // ============================================================

  async function handleLoadForecast(event) {
    event.preventDefault();

    const parsedTrackId = Number(trackId);

    if (
      !Number.isInteger(parsedTrackId) ||
      parsedTrackId <= 0
    ) {
      setForecast(null);

      setForecastError(
        'Enter a track ID using a whole number greater than 0.'
      );

      return;
    }

    try {
      setForecastLoading(true);
      setForecastError('');
      setForecast(null);

      const result =
        await getTrackForecast(
          parsedTrackId
        );

      setForecast(
        result.data || null
      );

      if (!result.data) {
        setForecastError(
          'Forecast intelligence is not available for this track.'
        );
      }
    } catch (error) {
      setForecast(null);

      setForecastError(
        error.message ||
        'Unable to load forecasting intelligence.'
      );
    } finally {
      setForecastLoading(false);
    }
  }


  // ============================================================
  // Load track anomalies
  // ============================================================

  async function handleLoadTrackAnomalies() {
    try {
      setTrackAnomaliesLoading(true);
      setTrackAnomaliesError('');
      setTrackAnomalies([]);
      setTrackAnomaliesLoaded(false);

      const result =
        await getTrackAnomalies(
          1,
          5
        );

      setTrackAnomalies(
        result.data || []
      );

      setTrackAnomaliesLoaded(true);
    } catch (error) {
      setTrackAnomalies([]);

      setTrackAnomaliesError(
        error.message ||
        'Unable to load track anomaly intelligence.'
      );

      setTrackAnomaliesLoaded(true);
    } finally {
      setTrackAnomaliesLoading(false);
    }
  }


  // ============================================================
  // Load artist anomalies
  // ============================================================

  async function handleLoadArtistAnomalies() {
    try {
      setArtistAnomaliesLoading(true);
      setArtistAnomaliesError('');
      setArtistAnomalies([]);
      setArtistAnomaliesLoaded(false);

      const result =
        await getArtistAnomalies(
          1,
          5
        );

      setArtistAnomalies(
        result.data || []
      );

      setArtistAnomaliesLoaded(true);
    } catch (error) {
      setArtistAnomalies([]);

      setArtistAnomaliesError(
        error.message ||
        'Unable to load artist anomaly intelligence.'
      );

      setArtistAnomaliesLoaded(true);
    } finally {
      setArtistAnomaliesLoading(false);
    }
  }


  // ============================================================
  // Number formatter
  // ============================================================

  function formatNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'Not available';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return 'Not available';
    }

    return number.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2
      }
    );
  }


  // ============================================================
  // Date formatter
  // ============================================================

  function formatDate(value) {
    if (!value) {
      return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      {/* ========================================================
          Intelligence page hero
      ======================================================== */}

      <section className="intelligence-page-hero">

        <p className="intelligence-page-kicker">
          PMIP Intelligence
        </p>

        <h1>
          Intelligence
        </h1>

        <p className="intelligence-page-description">
          Explore artist momentum, track forecasting, unusual
          streaming activity, geographic performance and market
          growth in one place.
        </p>


        <div className="intelligence-overview-grid">

          <article className="intelligence-overview-card">
            <span className="intelligence-overview-label">
              Momentum
            </span>

            <h3>
              Artist Momentum
            </h3>

            <p>
              See whether an artist&apos;s recent performance is
              building, holding steady or losing strength.
            </p>
          </article>


          <article className="intelligence-overview-card">
            <span className="intelligence-overview-label">
              Forecasting
            </span>

            <h3>
              Track Forecasting
            </h3>

            <p>
              See how close PMIP&apos;s predicted stream total was
              to the track&apos;s actual performance.
            </p>
          </article>


          <article className="intelligence-overview-card">
            <span className="intelligence-overview-label">
              Anomalies
            </span>

            <h3>
              Streaming Anomalies
            </h3>

            <p>
              Review unusual streaming behaviour identified by PMIP.
            </p>
          </article>


          <article className="intelligence-overview-card">
            <span className="intelligence-overview-label">
              Markets
            </span>

            <h3>
              Geographic &amp; Growth
            </h3>

            <p>
              Explore country performance and emerging market signals.
            </p>
          </article>

        </div>

      </section>


      {/* ========================================================
          Artist momentum intelligence
      ======================================================== */}

      <ContentSection
        title="Artist Momentum Intelligence"
        eyebrow="Momentum"
        variant="intelligence"
      >

        <p>
          Momentum shows the current strength of an artist&apos;s
          performance. PMIP combines available performance signals
          into one score so it is easier to see whether the artist
          is gaining attention and activity.
        </p>

        <br />

        <form onSubmit={handleLoadMomentum}>

          <label htmlFor="artistId">
            Artist ID
          </label>

          <input
            id="artistId"
            type="number"
            min="1"
            value={artistId}
            onChange={(event) =>
              setArtistId(
                event.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={momentumLoading}
          >
            {momentumLoading
              ? 'Loading...'
              : 'Load Momentum'}
          </button>

        </form>


        {momentumLoading && (
          <p>
            Loading artist momentum intelligence...
          </p>
        )}


        {!momentumLoading &&
          momentumError && (
            <p>
              {momentumError}
            </p>
          )}


        {!momentumLoading &&
          !momentumError &&
          momentum && (
            <>

              <div className="intelligence-summary-grid">

                <SummaryCard
                  label="Momentum Score"
                  value={
                    formatNumber(
                      momentum.final_momentum_score
                    )
                  }
                  helperText="A score from 0 to 100 showing the overall strength of the artist's current momentum. Higher scores indicate stronger momentum."
                  tone="highlight"
                />


                <SummaryCard
                  label="Momentum Category"
                  value={
                    momentum.momentum_category ||
                    'Not available'
                  }
                  helperText="A simple category that describes the strength of the artist's current momentum."
                />


                <SummaryCard
                  label="Momentum Rank"
                  value={
                    momentum.shared_score_rank ??
                    'Not available'
                  }
                  helperText="Shows where this artist sits compared with other artists measured by PMIP. A smaller rank number means a higher position."
                />

              </div>


              <MomentumScoreChart
                artistName={
                  momentum.artist_name
                }
                score={
                  momentum.final_momentum_score
                }
              />


              <div className="intelligence-insight-card">

                <div className="intelligence-insight-header">

                  <div>
                    <p className="intelligence-insight-kicker">
                      PMIP Interpretation
                    </p>

                    <h3>
                      What does this mean?
                    </h3>
                  </div>


                  <span className="intelligence-insight-badge">
                    {momentum.momentum_category ||
                      'Not available'}
                  </span>

                </div>


                <p className="intelligence-insight-text">

                  <strong>
                    {momentum.artist_name ||
                      'This artist'}
                  </strong>

                  {' '}has a current momentum score of{' '}

                  <strong>
                    {formatNumber(
                      momentum.final_momentum_score
                    )}
                  </strong>

                  {' '}out of 100. PMIP places this artist in the{' '}

                  <strong>
                    {momentum.momentum_category ||
                      'Not available'}
                  </strong>

                  {' '}momentum category. This gives a simple view
                  of how strong the artist&apos;s recent performance
                  signals are.
                </p>


                {momentum.main_neutral_driver && (
                  <div className="intelligence-driver-card">

                    <span>
                      Main contributing signal
                    </span>

                    <strong>
                      {momentum.main_neutral_driver}
                    </strong>

                    <p>
                      This is the performance signal that contributed
                      most strongly to the artist&apos;s current
                      momentum result.
                    </p>

                  </div>
                )}

              </div>

            </>
          )}

      </ContentSection>


      {/* ========================================================
          Track forecasting intelligence
      ======================================================== */}

      <ContentSection
        title="Track Forecasting Intelligence"
        eyebrow="Forecasting"
        variant="intelligence"
      >

        <p>
          Forecasting shows how close PMIP&apos;s predicted Spotify
          stream total was to the track&apos;s actual stream total.
          This helps show how accurately the model estimated the
          track&apos;s performance.
        </p>

        <br />

        <form onSubmit={handleLoadForecast}>

          <label htmlFor="forecastTrackId">
            Track ID
          </label>

          <input
            id="forecastTrackId"
            type="number"
            min="1"
            value={trackId}
            onChange={(event) =>
              setTrackId(
                event.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={forecastLoading}
          >
            {forecastLoading
              ? 'Loading...'
              : 'Load Forecast'}
          </button>

        </form>


        {forecastLoading && (
          <p>
            Loading track forecasting intelligence...
          </p>
        )}


        {!forecastLoading &&
          forecastError && (
            <p>
              {forecastError}
            </p>
          )}


        {!forecastLoading &&
          !forecastError &&
          forecast && (
            <>

              <div className="intelligence-result-heading">

                <p className="intelligence-result-kicker">
                  Forecast Result
                </p>

                <h3>
                  {forecast.track_name ||
                    `Track ${trackId}`}
                </h3>

              </div>


              <div className="intelligence-summary-grid intelligence-summary-grid-four">

                <SummaryCard
                  label="Predicted Streams"
                  value={
                    formatNumber(
                      forecast.predicted_spotify_streams
                    )
                  }
                  helperText="The number of Spotify streams PMIP expected this track to receive."
                />


                <SummaryCard
                  label="Actual Streams"
                  value={
                    formatNumber(
                      forecast.actual_spotify_streams
                    )
                  }
                  helperText="The number of Spotify streams the track actually received."
                />


                <SummaryCard
                  label="Prediction Difference"
                  value={
                    formatNumber(
                      forecast.absolute_prediction_error
                    )
                  }
                  helperText="Shows how far PMIP's prediction was from the actual stream total. A smaller difference means the prediction was closer."
                />


                <SummaryCard
                  label="Review Status"
                  value={
                    Number(
                      forecast.high_forecast_review_flag
                    ) === 1
                      ? 'Review Recommended'
                      : 'No Review Flag'
                  }
                  helperText={
                    Number(
                      forecast.high_forecast_review_flag
                    ) === 1
                      ? 'PMIP found a large enough difference between the prediction and the actual result that this forecast should be looked at more closely.'
                      : 'PMIP did not find a large enough difference to require additional review.'
                  }
                  tone="highlight"
                />

              </div>


              <ForecastComparisonChart
                trackName={
                  forecast.track_name
                }
                predictedStreams={
                  forecast.predicted_spotify_streams
                }
                actualStreams={
                  forecast.actual_spotify_streams
                }
              />


              <div className="intelligence-insight-card">

                <div className="intelligence-insight-header">

                  <div>
                    <p className="intelligence-insight-kicker">
                      PMIP Interpretation
                    </p>

                    <h3>
                      What does this forecast mean?
                    </h3>
                  </div>


                  <span className="intelligence-insight-badge">
                    {Number(
                      forecast.high_forecast_review_flag
                    ) === 1
                      ? 'Review Recommended'
                      : 'No Review Flag'}
                  </span>

                </div>


                <p className="intelligence-insight-text">
                  PMIP expected{' '}

                  <strong>
                    {forecast.track_name ||
                      'the selected track'}
                  </strong>

                  {' '}to receive approximately{' '}

                  <strong>
                    {formatNumber(
                      forecast.predicted_spotify_streams
                    )}
                  </strong>

                  {' '}Spotify streams. The track actually received{' '}

                  <strong>
                    {formatNumber(
                      forecast.actual_spotify_streams
                    )}
                  </strong>

                  {' '}streams.
                </p>


                <div className="intelligence-driver-card">

                  <span>
                    Prediction difference
                  </span>

                  <strong>
                    {formatNumber(
                      forecast.absolute_prediction_error
                    )} streams
                  </strong>

                  <p>
                    This shows how far PMIP&apos;s prediction was
                    from the actual stream total. A smaller
                    difference means the forecast was closer to
                    the real result.
                  </p>

                </div>


                <div className="intelligence-driver-card intelligence-driver-card-spaced">

                  <span>
                    Review status
                  </span>

                  <strong>
                    {Number(
                      forecast.high_forecast_review_flag
                    ) === 1
                      ? 'Review Recommended'
                      : 'No Review Flag'}
                  </strong>

                  <p>
                    {Number(
                      forecast.high_forecast_review_flag
                    ) === 1
                      ? 'The difference between the prediction and the actual result was large enough for PMIP to recommend a closer look.'
                      : 'The difference was not large enough for PMIP to recommend additional review.'}
                  </p>

                </div>

              </div>

            </>
          )}

      </ContentSection>


      {/* ========================================================
          Track anomaly intelligence
      ======================================================== */}

      <ContentSection
        title="Track Anomaly Intelligence"
        eyebrow="Anomalies"
        variant="intelligence"
      >

        <p>
          Track anomalies show moments when a track&apos;s streaming
          activity looks noticeably different from its usual or
          expected behaviour. PMIP highlights these changes so they
          can be investigated more closely.
        </p>

        <br />

        <button
          type="button"
          onClick={handleLoadTrackAnomalies}
          disabled={trackAnomaliesLoading}
        >
          {trackAnomaliesLoading
            ? 'Loading...'
            : 'Load Track Anomalies'}
        </button>


        {trackAnomaliesLoading && (
          <p className="intelligence-state-message">
            Loading track anomaly intelligence...
          </p>
        )}


        {!trackAnomaliesLoading &&
          trackAnomaliesError && (
            <p className="intelligence-state-message intelligence-state-error">
              {trackAnomaliesError}
            </p>
          )}


        {trackAnomaliesLoaded &&
          !trackAnomaliesLoading &&
          !trackAnomaliesError &&
          trackAnomalies.length === 0 && (
            <p className="intelligence-state-message">
              No unusual track activity was found.
            </p>
          )}


        {!trackAnomaliesLoading &&
          !trackAnomaliesError &&
          trackAnomalies.length > 0 && (
            <>

              <TrackAnomalyChart
                anomalies={trackAnomalies}
              />


              <div className="anomaly-results-list">

                {trackAnomalies.map(
                  (anomaly) => (
                    <article
                      className="anomaly-result-card"
                      key={anomaly.anomaly_result_id}
                    >

                      <div className="anomaly-result-header">

                        <div>
                          <p className="anomaly-result-kicker">
                            Track Anomaly
                          </p>

                          <h3>
                            {anomaly.track_name ||
                              `Track ${anomaly.track_id}`}
                          </h3>
                        </div>


                        <span className="anomaly-severity-badge">
                          {anomaly.anomaly_severity ||
                            'Not available'}
                        </span>

                      </div>


                      <div className="anomaly-metric-grid">

                        <SummaryCard
                          label="Anomaly Severity"
                          value={
                            anomaly.anomaly_severity ||
                            'Not available'
                          }
                          helperText="Shows how unusual the detected activity was. A stronger severity means the observation differed more noticeably from expected behaviour."
                        />


                        <SummaryCard
                          label="Direction"
                          value={
                            anomaly.anomaly_direction ||
                            'Not available'
                          }
                          helperText="Shows whether the unusual activity moved above or below the track's expected performance."
                        />


                        <SummaryCard
                          label="Streams"
                          value={
                            formatNumber(
                              anomaly.streams
                            )
                          }
                          helperText="The number of streams recorded for this observation."
                        />


                        <SummaryCard
                          label="Chart Position"
                          value={
                            anomaly.chart_position ??
                            'Not available'
                          }
                          helperText="The track's chart position when this unusual activity was recorded."
                        />


                        <SummaryCard
                          label="Anomaly Score"
                          value={
                            formatNumber(
                              anomaly.anomaly_score_ratio
                            )
                          }
                          helperText="Shows how strongly this observation differs from what PMIP expected. Higher values indicate more unusual behaviour."
                          tone="highlight"
                        />

                      </div>


                      <div className="anomaly-metadata">

                        <div className="anomaly-metadata-item">
                          <span>
                            Observation date
                          </span>

                          <strong>
                            {formatDate(
                              anomaly.observation_date
                            )}
                          </strong>
                        </div>


                        <div className="anomaly-metadata-item">
                          <span>
                            Market
                          </span>

                          <strong>
                            {anomaly.country_name ||
                              anomaly.source_country ||
                              (
                                anomaly.country_id
                                  ? `Country ${anomaly.country_id}`
                                  : 'Not available'
                              )}
                          </strong>
                        </div>

                      </div>


                      <div className="anomaly-interpretation">

                        <p className="intelligence-insight-kicker">
                          PMIP Interpretation
                        </p>

                        <h4>
                          What does this mean?
                        </h4>


                        <p>
                          PMIP found that this streaming observation
                          was noticeably different from the
                          track&apos;s expected behaviour.
                        </p>


                        <p>
                          The unusual activity was rated as{' '}

                          <strong>
                            {anomaly.anomaly_severity ||
                              'Not available'}
                          </strong>

                          {' '}in severity. Its direction was{' '}

                          <strong>
                            {anomaly.anomaly_direction ||
                              'Not available'}
                          </strong>

                          , showing whether the activity moved above
                          or below the expected level.
                        </p>

                      </div>

                    </article>
                  )
                )}

              </div>

            </>
          )}

      </ContentSection>


      {/* ========================================================
          Artist anomaly summaries
      ======================================================== */}

      <ContentSection
        title="Artist Anomaly Summary"
        eyebrow="Artist Anomalies"
        variant="intelligence"
      >

        <p>
          This summary shows how often unusual streaming activity
          appears across an artist&apos;s analysed observations.
          It helps highlight artists whose recent data may deserve
          closer attention.
        </p>

        <br />

        <button
          type="button"
          onClick={handleLoadArtistAnomalies}
          disabled={artistAnomaliesLoading}
        >
          {artistAnomaliesLoading
            ? 'Loading...'
            : 'Load Artist Anomalies'}
        </button>


        {artistAnomaliesLoading && (
          <p className="intelligence-state-message">
            Loading artist anomaly intelligence...
          </p>
        )}


        {!artistAnomaliesLoading &&
          artistAnomaliesError && (
            <p className="intelligence-state-message intelligence-state-error">
              {artistAnomaliesError}
            </p>
          )}


        {artistAnomaliesLoaded &&
          !artistAnomaliesLoading &&
          !artistAnomaliesError &&
          artistAnomalies.length === 0 && (
            <p className="intelligence-state-message">
              No unusual artist activity was found.
            </p>
          )}


        {!artistAnomaliesLoading &&
          !artistAnomaliesError &&
          artistAnomalies.length > 0 && (
            <>

              <ArtistAnomalyChart
                artists={artistAnomalies}
              />


              <div className="artist-anomaly-results-list">

                {artistAnomalies.map(
                  (artist) => (
                    <article
                      className="artist-anomaly-result-card"
                      key={artist.artist_id}
                    >

                      {/* ==========================================
                          Artist heading
                      ========================================== */}

                      <div className="artist-anomaly-result-header">

                        <div>
                          <p className="anomaly-result-kicker">
                            Artist Anomaly Summary
                          </p>

                          <h3>
                            {artist.artist_name ||
                              `Artist ${artist.artist_id}`}
                          </h3>
                        </div>


                        <div className="artist-anomaly-rate-badge">

                          <span>
                            Anomaly Rate
                          </span>

                          <strong>
                            {formatNumber(
                              artist.anomaly_rate_pct
                            )}%
                          </strong>

                        </div>

                      </div>


                      {/* ==========================================
                          Main metrics
                      ========================================== */}

                      <div className="artist-anomaly-metric-grid">

                        <SummaryCard
                          label="Total Observations"
                          value={
                            formatNumber(
                              artist.total_observations
                            )
                          }
                          helperText="The total number of artist observations checked by PMIP."
                        />


                        <SummaryCard
                          label="Detected Anomalies"
                          value={
                            formatNumber(
                              artist.final_anomaly_count
                            )
                          }
                          helperText="The number of observations that PMIP identified as unusually different from expected behaviour."
                          tone="highlight"
                        />


                        <SummaryCard
                          label="High-Priority"
                          value={
                            formatNumber(
                              artist.high_priority_anomaly_count
                            )
                          }
                          helperText="The number of unusual observations that PMIP considers important enough for closer review."
                        />


                        <SummaryCard
                          label="Extreme"
                          value={
                            formatNumber(
                              artist.extreme_anomaly_count
                            )
                          }
                          helperText="The number of observations showing the strongest unusual behaviour."
                        />


                        <SummaryCard
                          label="Positive"
                          value={
                            formatNumber(
                              artist.positive_anomaly_count
                            )
                          }
                          helperText="Unusual observations where activity moved above the expected level."
                        />


                        <SummaryCard
                          label="Negative"
                          value={
                            formatNumber(
                              artist.negative_anomaly_count
                            )
                          }
                          helperText="Unusual observations where activity moved below the expected level."
                        />


                        <SummaryCard
                          label="Review Score"
                          value={
                            formatNumber(
                              artist.artist_review_score
                            )
                          }
                          helperText="A PMIP score used to help show how strongly this artist may need further review."
                        />

                      </div>


                      {/* ==========================================
                          Metadata
                      ========================================== */}

                      <div className="anomaly-metadata">

                        <div className="anomaly-metadata-item">
                          <span>
                            Latest observation
                          </span>

                          <strong>
                            {formatDate(
                              artist.latest_observation_date
                            )}
                          </strong>
                        </div>


                        <div className="anomaly-metadata-item">
                          <span>
                            Overall anomaly rate
                          </span>

                          <strong>
                            {formatNumber(
                              artist.anomaly_rate_pct
                            )}%
                          </strong>
                        </div>

                      </div>


                      {/* ==========================================
                          Interpretation
                      ========================================== */}

                      <div className="anomaly-interpretation">

                        <p className="intelligence-insight-kicker">
                          PMIP Interpretation
                        </p>

                        <h4>
                          What does this mean?
                        </h4>


                        <p>
                          PMIP analysed{' '}

                          <strong>
                            {formatNumber(
                              artist.total_observations
                            )}
                          </strong>

                          {' '}observations for{' '}

                          <strong>
                            {artist.artist_name ||
                              `Artist ${artist.artist_id}`}
                          </strong>

                          {' '}and found{' '}

                          <strong>
                            {formatNumber(
                              artist.final_anomaly_count
                            )}
                          </strong>

                          {' '}that were unusually different from
                          the expected pattern.
                        </p>


                        <p>
                          The artist&apos;s anomaly rate is{' '}

                          <strong>
                            {formatNumber(
                              artist.anomaly_rate_pct
                            )}%
                          </strong>

                          . This means that this percentage of the
                          analysed observations was identified as
                          unusual by PMIP.
                        </p>


                        <p>
                          Positive anomalies show unusual increases
                          in activity, while negative anomalies show
                          unusual decreases. High-priority and
                          extreme counts highlight the observations
                          that may deserve the closest attention.
                        </p>

                      </div>

                    </article>
                  )
                )}

              </div>

            </>
          )}

      </ContentSection>


      {/* ========================================================
          Geographic and market intelligence
      ======================================================== */}

      <CountryGeographicSection />

      <CountryMarketGrowthSection />

      <ArtistGeographicSection />

      <ArtistMarketGrowthSection />

      <MarketMovementsSection />

    </PageContainer>
  );
}


export default IntelligencePage;