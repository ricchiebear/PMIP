import { useState } from 'react';

import PageContainer from '../components/layout/PageContainer';

import StreamingTrendChart from '../components/tracks/StreamingTrendChart';
import ChartPositionTrendChart from '../components/tracks/ChartPositionTrendChart';

import {
  getStreamingHistory,
  getChartPerformance
} from '../services/streamingService';


function TracksPage() {
  // ============================================================
  // Search inputs
  // ============================================================

  const [trackId, setTrackId] = useState('228');
  const [countryId, setCountryId] = useState('65');


  // ============================================================
  // Streaming data
  // ============================================================

  const [streamingHistory, setStreamingHistory] = useState([]);
  const [chartPerformance, setChartPerformance] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);


  // ============================================================
  // Load track performance
  // ============================================================

  async function handleLoadPerformance(event) {
    event.preventDefault();

    const parsedTrackId = Number(trackId);
    const parsedCountryId = Number(countryId);


    // ============================================================
    // Track ID validation
    // ============================================================

    if (
      !Number.isInteger(parsedTrackId) ||
      parsedTrackId <= 0
    ) {
      setStreamingHistory([]);
      setChartPerformance([]);
      setHasLoaded(false);

      setError(
        'Enter a track ID using a whole number greater than 0.'
      );

      return;
    }


    // ============================================================
    // Country ID validation
    // ============================================================

    if (
      !Number.isInteger(parsedCountryId) ||
      parsedCountryId <= 0
    ) {
      setStreamingHistory([]);
      setChartPerformance([]);
      setHasLoaded(false);

      setError(
        'Enter a country ID using a whole number greater than 0.'
      );

      return;
    }


    // ============================================================
    // Load performance data
    // ============================================================

    try {
      setLoading(true);
      setError('');
      setHasLoaded(false);

      setStreamingHistory([]);
      setChartPerformance([]);

      const [
        streamingResult,
        chartResult
      ] = await Promise.all([
        getStreamingHistory(
          parsedTrackId,
          parsedCountryId
        ),
        getChartPerformance(
          parsedTrackId,
          parsedCountryId
        )
      ]);


      // ============================================================
      // Sort streaming history
      // ============================================================

      const sortedStreaming =
        [...(streamingResult.data || [])].sort(
          (a, b) =>
            new Date(a.observation_date) -
            new Date(b.observation_date)
        );


      // ============================================================
      // Sort chart history
      // ============================================================

      const sortedChartPerformance =
        [...(chartResult.data || [])].sort(
          (a, b) =>
            new Date(a.observation_date) -
            new Date(b.observation_date)
        );


      setStreamingHistory(
        sortedStreaming
      );

      setChartPerformance(
        sortedChartPerformance
      );

      setHasLoaded(true);
    } catch (error) {
      setStreamingHistory([]);
      setChartPerformance([]);

      setError(
        error.message ||
        'We could not load this track performance. Please check the IDs and try again.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Date formatter
  // ============================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Not available';
    }

    return new Date(
      dateValue
    ).toLocaleDateString();
  }


  // ============================================================
  // Derived summary values
  // ============================================================

  const latestStreamingObservation =
    streamingHistory.length > 0
      ? streamingHistory[streamingHistory.length - 1]
      : null;

  const latestChartObservation =
    chartPerformance.length > 0
      ? chartPerformance[chartPerformance.length - 1]
      : null;


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      {/* ========================================================
          Page header
      ======================================================== */}

      <section className="track-page-header">
        <p className="track-page-kicker">
          Track Performance
        </p>

        <h1>
          Tracks
        </h1>

        <p>
          Explore historical streaming activity and chart
          performance for a selected track and country.
        </p>
      </section>


      {/* ========================================================
          Performance search
      ======================================================== */}

      <section className="track-search-panel">

        <div className="track-search-copy">
          <p className="track-page-kicker">
            Performance Lookup
          </p>

          <h2>
            Load Track Performance
          </h2>

          <p>
            Enter a PMIP track ID and country ID to retrieve
            historical streaming and chart data.
          </p>
        </div>


        <form
          className="track-search-form"
          onSubmit={handleLoadPerformance}
        >

          <div className="track-search-field">
            <label htmlFor="trackId">
              Track ID
            </label>

            <input
              id="trackId"
              type="number"
              min="1"
              value={trackId}
              onChange={(event) =>
                setTrackId(
                  event.target.value
                )
              }
            />
          </div>


          <div className="track-search-field">
            <label htmlFor="countryId">
              Country ID
            </label>

            <input
              id="countryId"
              type="number"
              min="1"
              value={countryId}
              onChange={(event) =>
                setCountryId(
                  event.target.value
                )
              }
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="track-search-button"
          >
            {loading
              ? 'Loading...'
              : 'Load Performance'}
          </button>

        </form>


        {error && (
          <p className="track-search-error">
            {error}
          </p>
        )}

      </section>


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <section className="track-state-card">
          <div
            className="artist-loading-spinner"
            aria-hidden="true"
          />

          <h3>
            Loading Track Performance
          </h3>

          <p>
            PMIP is retrieving streaming and chart-performance data.
          </p>
        </section>
      )}


      {/* ========================================================
          Performance results
      ======================================================== */}

      {hasLoaded &&
        !loading &&
        !error && (
          <>

            {/* ==================================================
                Summary metrics
            ================================================== */}

            <section className="track-profile-section">

              <div className="track-section-heading">
                <div>
                  <p className="track-page-kicker">
                    Overview
                  </p>

                  <h2>
                    Performance Summary
                  </h2>
                </div>

                <p>
                  A quick view of the selected track&apos;s latest
                  available performance.
                </p>
              </div>


              <div className="track-metric-grid">

                <article className="track-metric-card">
                  <p>
                    Streaming Observations
                  </p>

                  <strong>
                    {streamingHistory.length}
                  </strong>
                </article>


                <article className="track-metric-card">
                  <p>
                    Latest Streams
                  </p>

                  <strong>
                    {latestStreamingObservation
                      ? Number(
                          latestStreamingObservation.streams
                        ).toLocaleString()
                      : 'Not available'}
                  </strong>
                </article>


                <article className="track-metric-card">
                  <p>
                    Latest Chart Position
                  </p>

                  <strong>
                    {latestChartObservation?.chart_position ??
                      'Not available'}
                  </strong>
                </article>

              </div>

            </section>


            {/* ==================================================
                Streaming performance
            ================================================== */}

            <section className="track-profile-section">

              <div className="track-section-heading">
                <div>
                  <p className="track-page-kicker">
                    Streaming
                  </p>

                  <h2>
                    Historical Streaming Performance
                  </h2>
                </div>

                <p>
                  Review how streaming activity changed over the
                  available historical period.
                </p>
              </div>


              {streamingHistory.length === 0 ? (
                <div className="track-state-card">
                  <h3>
                    No Streaming History
                  </h3>

                  <p>
                    No streaming history was found for this track
                    and country.
                  </p>
                </div>
              ) : (
                <>
                  <div className="track-chart-container">
                    <StreamingTrendChart
                      data={streamingHistory}
                    />
                  </div>

                  <div className="track-record-grid">

                    {streamingHistory.map(
                      (observation) => (
                        <article
                          key={observation.observation_id}
                          className="track-record-card"
                        >
                          <p className="track-record-date">
                            {formatDate(
                              observation.observation_date
                            )}
                          </p>

                          <h3>
                            {observation.track_name}
                          </h3>

                          <div className="track-record-meta">

                            <div>
                              <span>
                                Country
                              </span>

                              <strong>
                                {observation.country_name}
                              </strong>
                            </div>


                            <div>
                              <span>
                                Streams
                              </span>

                              <strong>
                                {Number(
                                  observation.streams
                                ).toLocaleString()}
                              </strong>
                            </div>


                            <div>
                              <span>
                                Chart Position
                              </span>

                              <strong>
                                {observation.chart_position ??
                                  'Not available'}
                              </strong>
                            </div>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                </>
              )}

            </section>


            {/* ==================================================
                Historical chart performance
            ================================================== */}

            <section className="track-profile-section">

              <div className="track-section-heading">
                <div>
                  <p className="track-page-kicker">
                    Charts
                  </p>

                  <h2>
                    Historical Chart Performance
                  </h2>
                </div>

                <p>
                  Follow how the track&apos;s chart position changed
                  across the available historical period.
                </p>
              </div>


              {chartPerformance.length === 0 ? (
                <div className="track-state-card">
                  <h3>
                    No Chart History
                  </h3>

                  <p>
                    No chart-performance history was found for this
                    track and country.
                  </p>
                </div>
              ) : (
                <>
                  <div className="track-chart-container">
                    <ChartPositionTrendChart
                      data={chartPerformance}
                    />
                  </div>

                  <div className="track-record-grid">

                    {chartPerformance.map(
                      (observation) => (
                        <article
                          key={observation.observation_id}
                          className="track-record-card"
                        >
                          <p className="track-record-date">
                            {formatDate(
                              observation.observation_date
                            )}
                          </p>

                          <h3>
                            {observation.track_name}
                          </h3>

                          <div className="track-record-meta">

                            <div>
                              <span>
                                Country
                              </span>

                              <strong>
                                {observation.country_name}
                              </strong>
                            </div>


                            <div>
                              <span>
                                Chart Position
                              </span>

                              <strong>
                                {observation.chart_position ??
                                  'Not available'}
                              </strong>
                            </div>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                </>
              )}

            </section>

          </>
        )}

    </PageContainer>
  );
}


export default TracksPage;