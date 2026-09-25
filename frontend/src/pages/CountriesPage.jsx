import { useSearchParams } from 'react-router-dom';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';

import CountryGeographicSection from '../components/intelligence/CountryGeographicSection';
import CountryMarketGrowthSection from '../components/intelligence/CountryMarketGrowthSection';

import {
  getCountryName
} from '../utils/countryNames';


function CountriesPage() {
  // ============================================================
  // URL search
  // ============================================================

  const [searchParams] = useSearchParams();

  const selectedCountryCode =
    searchParams.get('search')?.trim() || '';


  // ============================================================
  // Country display name
  // ============================================================

  const selectedCountryName =
    selectedCountryCode
      ? getCountryName(
          selectedCountryCode,
          selectedCountryCode
        )
      : '';


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      <PageHeader
        title={
          selectedCountryName
            ? selectedCountryName
            : 'Countries'
        }
        description={
          selectedCountryName
            ? `Explore geographic and market-growth intelligence for ${selectedCountryName}.`
            : 'Explore geographic and market performance intelligence.'
        }
      />


      {/* ============================================================
          Selected market
      ============================================================ */}

      {selectedCountryName && (
        <section className="country-selected-market">

          <p className="country-selected-market-label">
            Selected Market
          </p>

          <h2>
            {selectedCountryName}
          </h2>

          <p>
            PMIP is showing available geographic and market-growth
            intelligence for this market.
          </p>

        </section>
      )}


      {/* ============================================================
          Country intelligence
      ============================================================ */}

      <CountryGeographicSection
        selectedCountryCode={selectedCountryCode}
      />

      <CountryMarketGrowthSection
        selectedCountryCode={selectedCountryCode}
      />

    </PageContainer>
  );
}


export default CountriesPage;