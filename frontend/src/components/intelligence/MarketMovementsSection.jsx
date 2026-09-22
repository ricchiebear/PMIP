import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';

import {
  getMarketMovements
} from '../../services/intelligenceService';

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
        error.message
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

    return Number(value).toLocaleString(
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

    return new Date(
      value
    ).toLocaleDateString();
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection title="Market Movements">

      <p>
        Explore signals showing market entry, expansion,
        contraction and cross-market momentum for tracks.
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


      {/* Error state */}

      {error && (
        <>
          <br />

          <p>
            {error}
          </p>
        </>
      )}


      {/* Empty state */}

      {hasLoaded &&
        !error &&
        movements.length === 0 && (
          <>
            <br />

            <p>
              No market movement intelligence is available for
              the latest intelligence run.
            </p>
          </>
        )}


      {/* Results */}

      {movements.length > 0 && (
        <>
          <br />

          {movements.map(
            (movement) => (
              <div
                key={movement.movement_id}
              >
                <h3>
                  {movement.track_name ||
                    movement.source_track_id ||
                    'Unknown track'}
                </h3>

                <SummaryCard
                  label="Market"
                  value={
                    movement.country_name ||
                    movement.source_country ||
                    'Unknown market'
                  }
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
                />

                <SummaryCard
                  label="Cross-Market Momentum"
                  value={
                    formatNumber(
                      movement.cross_market_momentum
                    )
                  }
                />

                <p>
                  First observation:{' '}
                  {formatDate(
                    movement.first_observation_date
                  )}
                </p>

                <p>
                  Latest observation:{' '}
                  {formatDate(
                    movement.latest_observation_date
                  )}
                </p>

                <h4>
                  What does this mean?
                </h4>

                <p>
                  This result describes how the track is moving
                  within the selected market, including whether
                  it is entering, expanding or contracting.
                </p>

                <hr />
              </div>
            )
          )}
        </>
      )}

    </ContentSection>
  );
}

export default MarketMovementsSection;