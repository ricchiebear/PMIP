import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';
import CountryGeographicChart from './CountryGeographicChart';

import {
  getCountryGeographicIntelligence
} from '../../services/intelligenceService';

function CountryGeographicSection() {
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
  // Load country geographic intelligence
  // ============================================================

  async function handleLoadCountries() {
    try {
      setLoading(true);
      setError('');
      setCountries([]);
      setHasLoaded(false);

      const result =
        await getCountryGeographicIntelligence(
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
    <ContentSection title="Country Geographic Performance">

      <p>
        Explore how countries perform across streaming strength,
        chart performance and overall market importance.
      </p>

      <br />

      <button
        type="button"
        onClick={handleLoadCountries}
        disabled={loading}
      >
        {loading
          ? 'Loading...'
          : 'Load Country Geographic Intelligence'}
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
              No country geographic intelligence was found.
            </p>
          </>
        )}


      {/* Results */}

      {countries.length > 0 && (
        <>
          <br />

          <CountryGeographicChart
            countries={countries}
          />

          <br />

          {countries.map(
            (country) => (
              <div
                key={country.country_geo_result_id}
              >
                <h3>
                  {country.country_name}
                </h3>

                <SummaryCard
                  label="Total Streams"
                  value={
                    formatNumber(
                      country.total_streams
                    )
                  }
                />

                <SummaryCard
                  label="Median Streams"
                  value={
                    formatNumber(
                      country.median_streams
                    )
                  }
                />

                <SummaryCard
                  label="Mean Streams"
                  value={
                    formatNumber(
                      country.mean_streams
                    )
                  }
                />

                <SummaryCard
                  label="Median Chart Position"
                  value={
                    formatNumber(
                      country.median_chart_position
                    )
                  }
                />

                <SummaryCard
                  label="Top 10 Rate"
                  value={
                    `${formatNumber(
                      country.top_10_rate_pct
                    )}%`
                  }
                />

                <SummaryCard
                  label="Top 50 Rate"
                  value={
                    `${formatNumber(
                      country.top_50_rate_pct
                    )}%`
                  }
                />

                <SummaryCard
                  label="Country Findings Index"
                  value={
                    country.country_findings_index
                  }
                />

                <SummaryCard
                  label="Country Classification"
                  value={
                    country.country_findings_class
                  }
                />

                <h4>
                  What does this mean?
                </h4>

                <p>
                  PMIP classifies this market as{' '}
                  {country.country_findings_class}.
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

export default CountryGeographicSection;