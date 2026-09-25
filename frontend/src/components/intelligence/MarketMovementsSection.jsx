import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';

import {
  getMarketMovements
} from '../../services/intelligenceService';

import {
  getCountryName
} from '../../utils/countryNames';


function MarketMovementsSection() {
  // ============================================================
  // Data
  // ============================================================

  const [movements, setMovements] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [hasLoaded, setHasLoaded] = useState(false);


  // ============================================================
  // Load market movements
  // ============================================================

  async function handleLoadMarketMovements() {
    try {
      setLoading(true);
      setError('');
      setMovements([]);
      setHasLoaded(false);

      const result =
        await getMarketMovements(
          1,
          5
        );

      setMovements(
        result.data || []
      );

      setHasLoaded(true);
    } catch (error) {
      setMovements([]);

      setError(
        error.message ||
        'Unable to load market movement intelligence.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
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
  // Track label
  // ============================================================

  function getTrackLabel(movement) {
    return (
      movement.track_name ||
      movement.source_track_id ||
      'Unknown track'
    );
  }


  // ============================================================
  // Market label
  // ============================================================

  function getMarketLabel(movement) {
    return getCountryName(
      movement.country_name ||
      movement.source_country,
      movement.country_code ||
      movement.source_country
    );
  }


  // ============================================================
  // Movement summary
  // ============================================================

  function getMovementSummary(movement) {
    const labels = [];

    if (
      Number(
        movement.market_entry_flag
      ) === 1
    ) {
      labels.push('Market Entry');
    }

    if (
      Number(
        movement.expansion_flag
      ) === 1
    ) {
      labels.push('Expansion');
    }

    if (
      Number(
        movement.contraction_flag
      ) === 1
    ) {
      labels.push('Contraction');
    }

    if (labels.length === 0) {
      return 'No major movement';
    }

    return labels.join(' • ');
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection
      title="Market Movements"
      eyebrow="Market Intelligence"
      variant="intelligence"
    >

      <p>
        See how tracks are moving across country markets. PMIP
        highlights when a track enters a market, grows its presence,
        loses strength or shows wider movement across several
        markets.
      </p>

      <br />

      <button
        type="button"
        onClick={handleLoadMarketMovements}
        disabled={loading}
      >
        {loading
          ? 'Loading...'
          : 'Load Market Movements'}
      </button>


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <p className="intelligence-state-message">
          Loading market movement intelligence...
        </p>
      )}


      {/* ========================================================
          Error state
      ======================================================== */}

      {!loading &&
        error && (
          <p className="intelligence-state-message intelligence-state-error">
            {error}
          </p>
        )}


      {/* ========================================================
          Empty state
      ======================================================== */}

      {hasLoaded &&
        !loading &&
        !error &&
        movements.length === 0 && (
          <p className="intelligence-state-message">
            No market movement information was found for the latest
            intelligence run.
          </p>
        )}


      {/* ========================================================
          Results
      ======================================================== */}

      {!loading &&
        !error &&
        movements.length > 0 && (
          <div className="market-movement-results-list">

            {movements.map(
              (movement) => (
                <article
                  className="market-movement-result-card"
                  key={movement.movement_id}
                >

                  {/* ==========================================
                      Heading
                  ========================================== */}

                  <div className="market-movement-header">

                    <div>
                      <p className="anomaly-result-kicker">
                        Market Movement
                      </p>

                      <h3>
                        {getTrackLabel(movement)}
                      </h3>

                      <p className="market-movement-market">
                        {getMarketLabel(movement)}
                      </p>
                    </div>


                    <span className="market-movement-badge">
                      {getMovementSummary(movement)}
                    </span>

                  </div>


                  {/* ==========================================
                      Main metrics
                  ========================================== */}

                  <div className="market-movement-metric-grid">

                    <SummaryCard
                      label="Market"
                      value={
                        getMarketLabel(movement)
                      }
                      helperText="The country market where this track's movement is being measured."
                    />


                    <SummaryCard
                      label="Market Entry"
                      value={
                        Number(
                          movement.market_entry_flag
                        ) === 1
                          ? 'Yes'
                          : 'No'
                      }
                      helperText="Shows whether PMIP identified this track as newly appearing in the market."
                    />


                    <SummaryCard
                      label="Expansion"
                      value={
                        Number(
                          movement.expansion_flag
                        ) === 1
                          ? 'Yes'
                          : 'No'
                      }
                      helperText="Shows whether the track appears to be strengthening or growing its presence in this market."
                    />


                    <SummaryCard
                      label="Contraction"
                      value={
                        Number(
                          movement.contraction_flag
                        ) === 1
                          ? 'Yes'
                          : 'No'
                      }
                      helperText="Shows whether the track appears to be losing strength or reducing its presence in this market."
                    />


                    <SummaryCard
                      label="Cross-Market Momentum"
                      value={
                        formatNumber(
                          movement.cross_market_momentum
                        )
                      }
                      helperText="A PMIP measure of how strongly the track is moving across multiple markets. Higher values indicate stronger overall market movement."
                      tone="highlight"
                    />

                  </div>


                  {/* ==========================================
                      Observation period
                  ========================================== */}

                  <div className="anomaly-metadata">

                    <div className="anomaly-metadata-item">
                      <span>
                        First observation
                      </span>

                      <strong>
                        {formatDate(
                          movement.first_observation_date
                        )}
                      </strong>
                    </div>


                    <div className="anomaly-metadata-item">
                      <span>
                        Latest observation
                      </span>

                      <strong>
                        {formatDate(
                          movement.latest_observation_date
                        )}
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
                      PMIP is tracking how{' '}

                      <strong>
                        {getTrackLabel(movement)}
                      </strong>

                      {' '}is changing within{' '}

                      <strong>
                        {getMarketLabel(movement)}
                      </strong>

                      .
                    </p>


                    <p>
                      The current movement status is{' '}

                      <strong>
                        {getMovementSummary(movement)}
                      </strong>

                      . This tells you whether the track is entering,
                      expanding within or losing strength in this
                      market.
                    </p>


                    <p>
                      Its Cross-Market Momentum score is{' '}

                      <strong>
                        {formatNumber(
                          movement.cross_market_momentum
                        )}
                      </strong>

                      . This provides a broader view of how strongly
                      the track is moving across different markets,
                      not just this one.
                    </p>

                  </div>

                </article>
              )
            )}

          </div>
        )}

    </ContentSection>
  );
}


export default MarketMovementsSection;