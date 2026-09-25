import { useEffect, useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';
import CountryMarketGrowthChart from './CountryMarketGrowthChart';

import {
  getCountryMarketGrowth
} from '../../services/intelligenceService';

import {
  getCountryName
} from '../../utils/countryNames';


function CountryMarketGrowthSection({
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
  // Load country market-growth intelligence
  // ============================================================

  async function loadMarketGrowth() {
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
        await getCountryMarketGrowth(
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
        'Unable to load country market-growth intelligence.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Manual load
  // ============================================================

  async function handleLoadMarketGrowth() {
    await loadMarketGrowth();
  }


  // ============================================================
  // Automatic selected-country load
  // ============================================================

  useEffect(() => {
    if (selectedCountryCode) {
      loadMarketGrowth();
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
          ? `${selectedCountryName} Market Growth`
          : 'Country Market Growth'
      }
      eyebrow="Market-Growth Intelligence"
      variant="intelligence"
    >

      <p>
        {selectedCountryName
          ? `See how much growth potential PMIP identifies for ${selectedCountryName}.`
          : 'Compare markets based on the level of future growth potential identified by PMIP.'}
      </p>


      {!selectedCountryCode && (
        <>
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
        </>
      )}


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <p className="intelligence-state-message">
          {selectedCountryName
            ? `Loading market-growth intelligence for ${selectedCountryName}...`
            : 'Loading country market-growth intelligence...'}
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
              ? `No market-growth intelligence was found for ${selectedCountryName}.`
              : 'No country market-growth intelligence was found.'}
          </p>
        )}


      {/* ========================================================
          Results
      ======================================================== */}

      {!loading &&
        !error &&
        countries.length > 0 && (
          <>

            <CountryMarketGrowthChart
              countries={countries}
            />


            <div className="market-growth-results-list">

              {countries.map(
                (country) => (
                  <article
                    className="market-growth-result-card"
                    key={country.country_growth_result_id}
                  >

                    {/* ==========================================
                        Country heading
                    ========================================== */}

                    <div className="market-growth-result-header">

                      <div>
                        <p className="anomaly-result-kicker">
                          Market Growth Profile
                        </p>

                        <h3>
                          {getCountryLabel(country)}
                        </h3>
                      </div>


                      <span className="market-growth-classification-badge">
                        {country.emerging_market_class ||
                          'Not available'}
                      </span>

                    </div>


                    {/* ==========================================
                        Main metrics
                    ========================================== */}

                    <div className="market-growth-metric-grid">

                      <SummaryCard
                        label="Emerging Market Score"
                        value={
                          formatNumber(
                            country.emerging_market_score
                          )
                        }
                        helperText="An overall PMIP score showing how much growth potential this market currently has. Higher scores indicate stronger potential."
                        tone="highlight"
                      />


                      <SummaryCard
                        label="Emerging Market Class"
                        value={
                          country.emerging_market_class ||
                          'Not available'
                        }
                        helperText="A simple category that describes the level of growth potential PMIP identifies for this market."
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
                        PMIP gives{' '}

                        <strong>
                          {getCountryLabel(country)}
                        </strong>

                        {' '}an Emerging Market Score of{' '}

                        <strong>
                          {formatNumber(
                            country.emerging_market_score
                          )}
                        </strong>

                        . This score gives an overall view of the
                        growth potential PMIP currently sees in
                        this market.
                      </p>


                      <p>
                        PMIP places this market in the{' '}

                        <strong>
                          {country.emerging_market_class ||
                            'Not available'}
                        </strong>

                        {' '}growth category. This makes it easier
                        to understand whether the market shows
                        relatively lower or stronger growth
                        potential.
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


export default CountryMarketGrowthSection;