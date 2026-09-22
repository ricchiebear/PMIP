import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';
import CountryMarketGrowthChart from './CountryMarketGrowthChart';

import {
  getCountryMarketGrowth
} from '../../services/intelligenceService';

function CountryMarketGrowthSection() {
  // ============================================================
  // Data
  // ============================================================

  const [countries, setCountries] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [hasLoaded, setHasLoaded] = useState(false);


  // ============================================================
  // Load country market-growth intelligence
  // ============================================================

  async function handleLoadMarketGrowth() {
    try {
      setLoading(true);
      setError('');
      setCountries([]);
      setHasLoaded(false);

      const result =
        await getCountryMarketGrowth(
          1,
          5
        );

      setCountries(
        result.data || []
      );

      setHasLoaded(true);
    } catch (error) {
      setCountries([]);

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
  // Section
  // ============================================================

  return (
    <ContentSection title="Country Market Growth">

      <p>
        Explore markets that PMIP identifies as having emerging
        or developing growth potential.
      </p>

      <br />

      <button
        type="button"
        onClick={handleLoadMarketGrowth}
        disabled={loading}
      >
        {loading
          ? 'Loading...'
          : 'Load Country Market Growth'}
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
        countries.length === 0 && (
          <>
            <br />

            <p>
              No country market-growth intelligence was found.
            </p>
          </>
        )}


      {/* Results */}

      {countries.length > 0 && (
        <>
          <br />

          <CountryMarketGrowthChart
            countries={countries}
          />

          <br />  

          {countries.map(
            (country) => (
              <div
                key={country.country_growth_result_id}
              >
                <h3>
                  {country.country_name}
                </h3>

                <SummaryCard
                  label="Emerging Market Score"
                  value={
                    formatNumber(
                      country.emerging_market_score
                    )
                  }
                />

                <SummaryCard
                  label="Emerging Market Class"
                  value={
                    country.emerging_market_class
                  }
                />

                <h4>
                  What does this mean?
                </h4>

                <p>
                  PMIP gives this market an emerging-market score
                  of{' '}
                  {formatNumber(
                    country.emerging_market_score
                  )}.
                </p>

                <p>
                  It is classified as{' '}
                  {country.emerging_market_class}.
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

export default CountryMarketGrowthSection;