import { useState } from 'react';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
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


    // Validation
    if (
      !Number.isInteger(parsedArtistId) ||
      parsedArtistId <= 0
    ) {
      setMomentum(null);

      setMomentumError(
        'Please enter a valid positive artist ID.'
      );

      return;
    }


    // Load momentum
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


    // Validation
    if (
      !Number.isInteger(parsedTrackId) ||
      parsedTrackId <= 0
    ) {
      setForecast(null);

      setForecastError(
        'Please enter a valid positive track ID.'
      );

      return;
    }


    // Load forecast
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

    return date.toLocaleDateString();
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      <PageHeader
        title="Intelligence"
        description="Explore momentum, forecasting, geographic, growth and anomaly intelligence."
      />


      {/* ========================================================
          Artist momentum intelligence
      ======================================================== */}

      <ContentSection title="Artist Momentum Intelligence">

        <p>
          Momentum helps describe how strongly an artist is
          currently performing based on the signals analysed by
          PMIP.
        </p>

        <br />

        <form onSubmit={handleLoadMomentum}>

          <label htmlFor="artistId">
            Artist ID
          </label>

          <br />

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

          <br />
          <br />

          <button
            type="submit"
            disabled={momentumLoading}
          >
            {momentumLoading
              ? 'Loading...'
              : 'Load Momentum'}
          </button>

        </form>


        {/* Momentum loading */}

        {momentumLoading && (
          <>
            <br />

            <p>
              Loading artist momentum intelligence...
            </p>
          </>
        )}


        {/* Momentum error / unavailable */}

        {!momentumLoading &&
          momentumError && (
            <>
              <br />

              <p>
                {momentumError}
              </p>
            </>
          )}


        {/* Momentum result */}

        {!momentumLoading &&
          !momentumError &&
          momentum && (
            <>
              <br />

              <h3>
                {momentum.artist_name}
              </h3>

              <SummaryCard
                label="Momentum Score"
                value={
                  momentum.final_momentum_score
                }
              />

              <SummaryCard
                label="Momentum Category"
                value={
                  momentum.momentum_category
                }
              />

              <SummaryCard
                label="Momentum Rank"
                value={
                  momentum.shared_score_rank ??
                  'Not available'
                }
              />

              <MomentumScoreChart
                artistName={
                  momentum.artist_name
                }
                score={
                  momentum.final_momentum_score
                }
              />

              <h3>
                What does this mean?
              </h3>

              <p>
                {momentum.artist_name} has a momentum score of{' '}
                {momentum.final_momentum_score} and is currently
                classified as{' '}
                {momentum.momentum_category}.
              </p>

              {momentum.main_neutral_driver && (
                <p>
                  Main contributing signal:{' '}
                  {momentum.main_neutral_driver}.
                </p>
              )}
            </>
          )}

      </ContentSection>


      {/* ========================================================
          Track forecasting intelligence
      ======================================================== */}

      <ContentSection title="Track Forecasting Intelligence">

        <p>
          Forecasting compares PMIP&apos;s predicted Spotify stream
          performance with the observed stream total for a track.
        </p>

        <br />

        <form onSubmit={handleLoadForecast}>

          <label htmlFor="forecastTrackId">
            Track ID
          </label>

          <br />

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

          <br />
          <br />

          <button
            type="submit"
            disabled={forecastLoading}
          >
            {forecastLoading
              ? 'Loading...'
              : 'Load Forecast'}
          </button>

        </form>


        {/* Forecast loading */}

        {forecastLoading && (
          <>
            <br />

            <p>
              Loading track forecasting intelligence...
            </p>
          </>
        )}


        {/* Forecast error / unavailable */}

        {!forecastLoading &&
          forecastError && (
            <>
              <br />

              <p>
                {forecastError}
              </p>
            </>
          )}


        {/* Forecast result */}

        {!forecastLoading &&
          !forecastError &&
          forecast && (
            <>
              <br />

              <h3>
                {forecast.track_name}
              </h3>

              <SummaryCard
                label="Predicted Spotify Streams"
                value={
                  formatNumber(
                    forecast.predicted_spotify_streams
                  )
                }
              />

              <SummaryCard
                label="Actual Spotify Streams"
                value={
                  formatNumber(
                    forecast.actual_spotify_streams
                  )
                }
              />

              <SummaryCard
                label="Prediction Difference"
                value={
                  formatNumber(
                    forecast.absolute_prediction_error
                  )
                }
              />

              <SummaryCard
                label="Forecast Review Status"
                value={
                  Number(
                    forecast.high_forecast_review_flag
                  ) === 1
                    ? 'Review Recommended'
                    : 'No Review Flag'
                }
              />

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

              <h3>
                What does this mean?
              </h3>

              <p>
                PMIP predicted approximately{' '}
                {formatNumber(
                  forecast.predicted_spotify_streams
                )}{' '}
                Spotify streams for {forecast.track_name}.
              </p>

              <p>
                The observed stream total was approximately{' '}
                {formatNumber(
                  forecast.actual_spotify_streams
                )}.
              </p>

              <p>
                The difference between the prediction and the
                observed result was approximately{' '}
                {formatNumber(
                  forecast.absolute_prediction_error
                )}{' '}
                streams.
              </p>
            </>
          )}

      </ContentSection>


      {/* ========================================================
          Track anomaly intelligence
      ======================================================== */}

      <ContentSection title="Track Anomaly Intelligence">

        <p>
          Track anomalies highlight unusual streaming observations
          identified by the PMIP anomaly-detection model.
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


        {/* Track anomaly loading */}

        {trackAnomaliesLoading && (
          <>
            <br />

            <p>
              Loading track anomaly intelligence...
            </p>
          </>
        )}


        {/* Track anomaly error */}

        {!trackAnomaliesLoading &&
          trackAnomaliesError && (
            <>
              <br />

              <p>
                {trackAnomaliesError}
              </p>
            </>
          )}


        {/* Track anomaly empty state */}

        {trackAnomaliesLoaded &&
          !trackAnomaliesLoading &&
          !trackAnomaliesError &&
          trackAnomalies.length === 0 && (
            <>
              <br />

              <p>
                No track anomalies were found.
              </p>
            </>
          )}


        {/* Track anomaly results */}

        {!trackAnomaliesLoading &&
          !trackAnomaliesError &&
          trackAnomalies.length > 0 && (
            <>
              <br />

              <TrackAnomalyChart
                anomalies={trackAnomalies}
              />

              <br />

              {trackAnomalies.map(
                (anomaly) => (
                  <div
                    key={anomaly.anomaly_result_id}
                  >
                    <h3>
                      {anomaly.track_name ||
                        `Track ${anomaly.track_id}`}
                    </h3>

                    <SummaryCard
                      label="Anomaly Severity"
                      value={
                        anomaly.anomaly_severity ||
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Anomaly Direction"
                      value={
                        anomaly.anomaly_direction ||
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Streams"
                      value={
                        formatNumber(
                          anomaly.streams
                        )
                      }
                    />

                    <SummaryCard
                      label="Chart Position"
                      value={
                        anomaly.chart_position ??
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Anomaly Score Ratio"
                      value={
                        formatNumber(
                          anomaly.anomaly_score_ratio
                        )
                      }
                    />

                    <p>
                      <strong>
                        Observation date:
                      </strong>{' '}
                      {formatDate(
                        anomaly.observation_date
                      )}
                    </p>

                    <p>
                      <strong>
                        Country ID:
                      </strong>{' '}
                      {anomaly.country_id ??
                        'Not available'}
                    </p>

                    <h4>
                      What does this mean?
                    </h4>

                    <p>
                      PMIP identified this observation as unusual.
                      The anomaly was classified as{' '}
                      {anomaly.anomaly_severity ||
                        'an unavailable severity'} with a{' '}
                      {anomaly.anomaly_direction ||
                        'currently unavailable'} direction.
                    </p>

                    <hr />
                  </div>
                )
              )}
            </>
          )}

      </ContentSection>


      {/* ========================================================
          Artist anomaly summaries
      ======================================================== */}

      <ContentSection title="Artist Anomaly Summary">

        <p>
          Artist anomaly summaries combine unusual streaming
          observations to provide a higher-level view of anomaly
          activity for each artist.
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


        {/* Artist anomaly loading */}

        {artistAnomaliesLoading && (
          <>
            <br />

            <p>
              Loading artist anomaly intelligence...
            </p>
          </>
        )}


        {/* Artist anomaly error */}

        {!artistAnomaliesLoading &&
          artistAnomaliesError && (
            <>
              <br />

              <p>
                {artistAnomaliesError}
              </p>
            </>
          )}


        {/* Artist anomaly empty state */}

        {artistAnomaliesLoaded &&
          !artistAnomaliesLoading &&
          !artistAnomaliesError &&
          artistAnomalies.length === 0 && (
            <>
              <br />

              <p>
                No artist anomaly summaries were found.
              </p>
            </>
          )}


        {/* Artist anomaly results */}

        {!artistAnomaliesLoading &&
          !artistAnomaliesError &&
          artistAnomalies.length > 0 && (
            <>
              <br />

              <ArtistAnomalyChart
                artists={artistAnomalies}
              />

              <br />

              {artistAnomalies.map(
                (artist) => (
                  <div
                    key={artist.artist_id}
                  >
                    <h3>
                      {artist.artist_name ||
                        `Artist ${artist.artist_id}`}
                    </h3>

                    <SummaryCard
                      label="Total Observations"
                      value={
                        formatNumber(
                          artist.total_observations
                        )
                      }
                    />

                    <SummaryCard
                      label="Detected Anomalies"
                      value={
                        formatNumber(
                          artist.final_anomaly_count
                        )
                      }
                    />

                    <SummaryCard
                      label="High-Priority Anomalies"
                      value={
                        formatNumber(
                          artist.high_priority_anomaly_count
                        )
                      }
                    />

                    <SummaryCard
                      label="Extreme Anomalies"
                      value={
                        formatNumber(
                          artist.extreme_anomaly_count
                        )
                      }
                    />

                    <SummaryCard
                      label="Positive Anomalies"
                      value={
                        formatNumber(
                          artist.positive_anomaly_count
                        )
                      }
                    />

                    <SummaryCard
                      label="Negative Anomalies"
                      value={
                        formatNumber(
                          artist.negative_anomaly_count
                        )
                      }
                    />

                    <SummaryCard
                      label="Anomaly Rate"
                      value={
                        `${formatNumber(
                          artist.anomaly_rate_pct
                        )}%`
                      }
                    />

                    <SummaryCard
                      label="Artist Review Score"
                      value={
                        formatNumber(
                          artist.artist_review_score
                        )
                      }
                    />

                    <p>
                      <strong>
                        Latest observation:
                      </strong>{' '}
                      {formatDate(
                        artist.latest_observation_date
                      )}
                    </p>

                    <h4>
                      What does this mean?
                    </h4>

                    <p>
                      PMIP detected{' '}
                      {formatNumber(
                        artist.final_anomaly_count
                      )}{' '}
                      unusual observations across{' '}
                      {formatNumber(
                        artist.total_observations
                      )}{' '}
                      analysed observations for{' '}
                      {artist.artist_name ||
                        `Artist ${artist.artist_id}`}.
                    </p>

                    <p>
                      The overall anomaly rate was approximately{' '}
                      {formatNumber(
                        artist.anomaly_rate_pct
                      )}%.
                    </p>

                    <hr />
                  </div>
                )
              )}
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