import { useEffect, useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';
import CountryGeographicChart from './CountryGeographicChart';

import {
  getCountryGeographicIntelligence
} from '../../services/intelligenceService';

import {
  getCountryName
} from '../../utils/countryNames';


function CountryGeographicSection({
  selectedCountryCode = ''
}) {
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
  // Selected country
  // ============================================================

  const selectedCountryName =
    selectedCountryCode
      ? getCountryName(
          selectedCountryCode,
          selectedCountryCode
        )
      : '';


  // ============================================================
  // Country matching
  // ============================================================

  function countryMatchesSelection(country) {
    if (!selectedCountryCode) {
      return true;
    }

    const selectedCode =
      selectedCountryCode
        .trim()
        .toLowerCase();

    const selectedName =
      selectedCountryName
        .trim()
        .toLowerCase();

    const countryCode =
      String(
        country.country_code ||
        country.source_country ||
        ''
      )
        .trim()
        .toLowerCase();

    const countryName =
      String(
        country.country_name ||
        country.source_country ||
        ''
      )
        .trim()
        .toLowerCase();

    const formattedCountryName =
      getCountryName(
        country.country_name ||
        country.source_country,
        country.country_code ||
        country.source_country
      )
        .trim()
        .toLowerCase();

    return (
      countryCode === selectedCode ||
      countryName === selectedCode ||
      countryName === selectedName ||
      formattedCountryName === selectedName
    );
  }


  // ============================================================
  // Load country geographic intelligence
  // ============================================================

  async function loadCountries() {
    try {
      setLoading(true);
      setError('');
      setCountries([]);
      setHasLoaded(false);

      const limit =
        selectedCountryCode
          ? 100
          : 5;

      const result =
        await getCountryGeographicIntelligence(
          1,
          limit
        );

      const results =
        result.data || [];

      const filteredCountries =
        selectedCountryCode
          ? results.filter(
              countryMatchesSelection
            )
          : results;

      setCountries(
        filteredCountries
      );

      setHasLoaded(true);
    } catch (error) {
      setCountries([]);

      setError(
        error.message ||
        'Unable to load country geographic intelligence.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Manual load
  // ============================================================

  async function handleLoadCountries() {
    await loadCountries();
  }


  // ============================================================
  // Automatic selected-country load
  // ============================================================

  useEffect(() => {
    if (selectedCountryCode) {
      loadCountries();
    }
  }, [selectedCountryCode]);


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
  // Country label
  // ============================================================

  function getCountryLabel(country) {
    return getCountryName(
      country.country_name ||
      country.source_country,
      country.country_code ||
      country.source_country
    );
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection
      title={
        selectedCountryName
          ? `${selectedCountryName} Geographic Performance`
          : 'Country Geographic Performance'
      }
      eyebrow="Geographic Intelligence"
      variant="intelligence"
    >

      <p>
        {selectedCountryName
          ? `See how ${selectedCountryName} performs based on its streaming activity, chart results and overall market strength.`
          : 'Compare how different countries perform based on streaming activity, chart results and overall market strength.'}
      </p>


      {!selectedCountryCode && (
        <>
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
        </>
      )}


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <p className="intelligence-state-message">
          {selectedCountryName
            ? `Loading geographic intelligence for ${selectedCountryName}...`
            : 'Loading country geographic intelligence...'}
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
        countries.length === 0 && (
          <p className="intelligence-state-message">
            {selectedCountryName
              ? `No geographic intelligence was found for ${selectedCountryName}.`
              : 'No country geographic intelligence was found.'}
          </p>
        )}


      {/* ========================================================
          Results
      ======================================================== */}

      {!loading &&
        !error &&
        countries.length > 0 && (
          <>

            <CountryGeographicChart
              countries={countries}
            />


            <div className="geographic-results-list">

              {countries.map(
                (country) => (
                  <article
                    className="geographic-result-card"
                    key={country.country_geo_result_id}
                  >

                    {/* ==========================================
                        Country heading
                    ========================================== */}

                    <div className="geographic-result-header">

                      <div>
                        <p className="anomaly-result-kicker">
                          Market Geographic Profile
                        </p>

                        <h3>
                          {getCountryLabel(country)}
                        </h3>
                      </div>


                      <span className="geographic-classification-badge">
                        {country.country_findings_class ||
                          'Not available'}
                      </span>

                    </div>


                    {/* ==========================================
                        Main metrics
                    ========================================== */}

                    <div className="geographic-metric-grid">

                      <SummaryCard
                        label="Total Streams"
                        value={
                          formatNumber(
                            country.total_streams
                          )
                        }
                        helperText="The total number of streams recorded for this market."
                      />


                      <SummaryCard
                        label="Median Streams"
                        value={
                          formatNumber(
                            country.median_streams
                          )
                        }
                        helperText="The middle streaming value across the observations in this market, which helps reduce the effect of unusually high or low results."
                      />


                      <SummaryCard
                        label="Mean Streams"
                        value={
                          formatNumber(
                            country.mean_streams
                          )
                        }
                        helperText="The average number of streams across the observations in this market."
                      />


                      <SummaryCard
                        label="Median Chart Position"
                        value={
                          formatNumber(
                            country.median_chart_position
                          )
                        }
                        helperText="The middle chart position across the market's observations. A smaller number means a stronger chart position."
                      />


                      <SummaryCard
                        label="Top 10 Rate"
                        value={
                          `${formatNumber(
                            country.top_10_rate_pct
                          )}%`
                        }
                        helperText="The percentage of analysed observations that reached the Top 10."
                      />


                      <SummaryCard
                        label="Top 50 Rate"
                        value={
                          `${formatNumber(
                            country.top_50_rate_pct
                          )}%`
                        }
                        helperText="The percentage of analysed observations that reached the Top 50."
                      />


                      <SummaryCard
                        label="Geographic Strength Index"
                        value={
                          formatNumber(
                            country.country_findings_index
                          )
                        }
                        helperText="An overall PMIP score that combines streaming and chart signals to show the strength of this market. Higher values indicate stronger performance."
                        tone="highlight"
                      />


                      <SummaryCard
                        label="Classification"
                        value={
                          country.country_findings_class ||
                          'Not available'
                        }
                        helperText="A simple category that summarises the market's overall geographic performance."
                      />

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
                        PMIP places{' '}

                        <strong>
                          {getCountryLabel(country)}
                        </strong>

                        {' '}in the{' '}

                        <strong>
                          {country.country_findings_class ||
                            'Not available'}
                        </strong>

                        {' '}performance category based on a
                        combination of streaming activity and chart
                        results.
                      </p>


                      <p>
                        The market&apos;s Geographic Strength Index is{' '}

                        <strong>
                          {formatNumber(
                            country.country_findings_index
                          )}
                        </strong>

                        . This score gives a simple overall view of
                        how strongly the market is performing within
                        PMIP&apos;s geographic intelligence.
                      </p>

                    </div>

                  </article>
                )
              )}

            </div>

          </>
        )}

    </ContentSection>
  );
}


export default CountryGeographicSection;