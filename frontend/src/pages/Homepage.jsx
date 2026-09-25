import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCountryName } from '../utils/countryNames';

import PageContainer from '../components/layout/PageContainer';


function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState({
    artists: [],
    tracks: [],
    releases: [],
    countries: []
  });

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [dashboardSummary, setDashboardSummary] = useState({
    artists: null,
    tracks: null,
    releases: null,
    countries: null
  });

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);


  // ============================================================
  // Dashboard summary
  // ============================================================

  useEffect(() => {
    async function loadDashboardSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(false);

        const response = await fetch(
          'http://localhost:3000/api/dashboard/summary'
        );

        if (!response.ok) {
          throw new Error(
            'Dashboard summary request failed.'
          );
        }

        const result = await response.json();

        setDashboardSummary({
          artists: result.data.artists,
          tracks: result.data.tracks,
          releases: result.data.releases,
          countries: result.data.countries
        });
      } catch (error) {
        console.error(
          'Failed to load dashboard summary:',
          error
        );

        setSummaryError(true);
      } finally {
        setSummaryLoading(false);
      }
    }

    loadDashboardSummary();
  }, []);


  // ============================================================
  // Global search
  // ============================================================

  async function runGlobalSearch(query) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults({
        artists: [],
        tracks: [],
        releases: [],
        countries: []
      });

      setShowSearchResults(false);

      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(false);
      setShowSearchResults(true);

      const response = await fetch(
        `http://localhost:3000/api/search?q=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      if (!response.ok) {
        throw new Error(
          'Global search request failed.'
        );
      }

      const result = await response.json();

      setSearchResults({
        artists: result.data.artists ?? [],
        tracks: result.data.tracks ?? [],
        releases: result.data.releases ?? [],
        countries: result.data.countries ?? []
      });
    } catch (error) {
      console.error(
        'Failed to search PMIP:',
        error
      );

      setSearchError(true);
    } finally {
      setSearchLoading(false);
    }
  }


  // ============================================================
  // Live search
  // ============================================================

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults({
        artists: [],
        tracks: [],
        releases: [],
        countries: []
      });

      setShowSearchResults(false);

      return undefined;
    }

    const searchTimer = setTimeout(() => {
      runGlobalSearch(trimmedQuery);
    }, 350);

    return () => {
      clearTimeout(searchTimer);
    };
  }, [searchQuery]);


  // ============================================================
  // Search submit
  // ============================================================

  const handleSearch = (event) => {
    event.preventDefault();

    runGlobalSearch(searchQuery);
  };


  // ============================================================
  // Popular searches
  // ============================================================

  const popularSearches = [
    'The Weeknd',
    'Pop',
    'Hip-Hop',
    'Latin',
    '2024 Trends'
  ];


  // ============================================================
  // Number formatting
  // ============================================================

  function formatCount(value) {
    if (value === null || value === undefined) {
      return '—';
    }

    return new Intl.NumberFormat('en-GB').format(value);
  }


  // ============================================================
  // Search result count
  // ============================================================

  const totalSearchResults =
    searchResults.artists.length +
    searchResults.tracks.length +
    searchResults.releases.length +
    searchResults.countries.length;


  // ============================================================
  // Dashboard statistics
  // ============================================================

  const dashboardStats = [
    {
      icon: '♫',
      value: dashboardSummary.tracks,
      label: 'Total Tracks',
      helperText: 'Explore track intelligence',
      link: '/tracks'
    },
    {
      icon: '◉',
      value: dashboardSummary.artists,
      label: 'Artists',
      helperText: 'Explore artist intelligence',
      link: '/artists'
    },
    {
      icon: '◌',
      value: dashboardSummary.releases,
      label: 'Releases',
      helperText: 'Explore release intelligence',
      link: '/releases'
    },
    {
      icon: '◎',
      value: dashboardSummary.countries,
      label: 'Countries',
      helperText: 'Explore geographic intelligence',
      link: '/countries'
    }
  ];


  return (
    <PageContainer>

      {/* ============================================================
          Hero
      ============================================================ */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-overlay" />

        <div className="dashboard-hero-content">

          <div className="dashboard-hero-copy">

            <p className="dashboard-hero-eyebrow">
              Global Music Intelligence
            </p>

            <h1 className="dashboard-hero-title">
              Music Data.
              <br />
              Deeper{' '}
              <span>
                Insights.
              </span>
            </h1>

            <p className="dashboard-hero-description">
              Discover artists, tracks, releases and global music
              trends through intelligent data analysis.
            </p>


            {/* ========================================================
                Global search
            ======================================================== */}

            <div className="dashboard-search-wrapper">

              <form
                className="dashboard-search"
                onSubmit={handleSearch}
              >

                <span className="dashboard-search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  onFocus={() => {
                    if (searchQuery.trim()) {
                      setShowSearchResults(true);
                    }
                  }}
                  placeholder="Search for an artist, track, release or country..."
                  aria-label="Search PMIP"
                />

                <button type="submit">
                  Search
                </button>

              </form>


              {/* ======================================================
                  Search results
              ====================================================== */}

              {showSearchResults && (
                <div className="dashboard-search-results">

                  {searchLoading && (
                    <div className="dashboard-search-status">
                      Searching PMIP...
                    </div>
                  )}

                  {!searchLoading && searchError && (
                    <div className="dashboard-search-status dashboard-search-status-error">
                      Search is temporarily unavailable.
                    </div>
                  )}

                  {!searchLoading &&
                    !searchError &&
                    totalSearchResults === 0 && (
                      <div className="dashboard-search-status">
                        No results found for &quot;{searchQuery}&quot;.
                      </div>
                    )}

                  {!searchLoading &&
                    !searchError &&
                    totalSearchResults > 0 && (
                      <div className="dashboard-search-groups">


                        {/* ============================================
                            Artists
                        ============================================ */}

                        {searchResults.artists.length > 0 && (
                          <div className="dashboard-search-group">

                            <p className="dashboard-search-group-title">
                              Artists
                            </p>

                            {searchResults.artists.map((artist) => (
                              <Link
                                key={artist.artist_id}
                                to={`/artists/${artist.artist_id}`}
                                className="dashboard-search-result"
                                onClick={() =>
                                  setShowSearchResults(false)
                                }
                              >

                                <span className="dashboard-search-result-icon">
                                  ◉
                                </span>

                                <div>
                                  <strong>
                                    {artist.artist_name}
                                  </strong>

                                  <span>
                                    Artist
                                  </span>
                                </div>

                              </Link>
                            ))}

                          </div>
                        )}


                        {/* ============================================
                            Tracks
                        ============================================ */}

                        {searchResults.tracks.length > 0 && (
                          <div className="dashboard-search-group">

                            <p className="dashboard-search-group-title">
                              Tracks
                            </p>

                            {searchResults.tracks.map((track) => (
                              <Link
                                key={track.track_id}
                                to={`/tracks/${track.track_id}`}
                                className="dashboard-search-result"
                                onClick={() =>
                                  setShowSearchResults(false)
                                }
                              >

                                <span className="dashboard-search-result-icon">
                                  ♫
                                </span>

                                <div>
                                  <strong>
                                    {track.track_name}
                                  </strong>

                                  <span>
                                    Track
                                    {track.isrc
                                      ? ` · ${track.isrc}`
                                      : ''}
                                  </span>
                                </div>

                              </Link>
                            ))}

                          </div>
                        )}


                        {/* ============================================
                            Releases
                        ============================================ */}

                        {searchResults.releases.length > 0 && (
                          <div className="dashboard-search-group">

                            <p className="dashboard-search-group-title">
                              Releases
                            </p>

                            {searchResults.releases.map((release) => (
                              <Link
                                key={release.release_id}
                                to={`/releases/${release.release_id}`}
                                className="dashboard-search-result"
                                onClick={() =>
                                  setShowSearchResults(false)
                                }
                              >

                                <span className="dashboard-search-result-icon">
                                  ◌
                                </span>

                                <div>
                                  <strong>
                                    {release.release_title}
                                  </strong>

                                  <span>
                                    {release.release_type ||
                                      'Release'}
                                  </span>
                                </div>

                              </Link>
                            ))}

                          </div>
                        )}


                        {/* ============================================
                            Countries
                        ============================================ */}

                        {searchResults.countries.length > 0 && (
                          <div className="dashboard-search-group">

                            <p className="dashboard-search-group-title">
                              Countries
                            </p>

                            {searchResults.countries.map((country) => (
                              <Link
                                key={country.country_id}
                                to={`/countries?search=${encodeURIComponent(
                                  country.country_code || country.country_name
                                )}`}
                                className="dashboard-search-result"
                                onClick={() =>
                                  setShowSearchResults(false)
                                }
                              >

                                <span className="dashboard-search-result-icon">
                                  ◎
                                </span>

                                <div>
                                  <strong>
                                    {getCountryName(
                                      country.country_name, 
                                      country.country_code
                                      )}
                                  </strong>

                                  <span>
                                    {country.country_code
                                      ? country.country_code.toUpperCase()
                                      : 'Country'}
                                  </span>
                                </div>

                              </Link>
                            ))}

                          </div>
                        )}

                      </div>
                    )}

                </div>
              )}

            </div>


            {/* ========================================================
                Popular searches
            ======================================================== */}

            <div className="dashboard-popular-searches">

              <span className="dashboard-popular-label">
                Popular searches:
              </span>

              <div className="dashboard-search-tags">

                {popularSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    className="dashboard-search-tag"
                    onClick={() => {
                      setSearchQuery(search);
                      runGlobalSearch(search);
                    }}
                  >
                    {search}
                  </button>
                ))}

              </div>

            </div>

          </div>


          {/* ============================================================
              Hero side message
          ============================================================ */}

          <div className="dashboard-hero-message">

            <p className="dashboard-hero-message-title">
              Data
              <br />
              People
              <br />
              Music
              <br />
              A Brighter
              <br />
              Industry
            </p>

            <span className="dashboard-hero-message-line" />

            <p className="dashboard-hero-message-description">
              Turning music data into meaningful opportunities.
            </p>

          </div>

        </div>

      </section>


      {/* ============================================================
          Dashboard statistics
      ============================================================ */}

      <section className="dashboard-stats-section">

        {summaryError && (
          <p className="dashboard-summary-error">
            Dashboard statistics are temporarily unavailable.
          </p>
        )}

        <div className="dashboard-stats-grid">

          {dashboardStats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="dashboard-stat-card"
            >

              <div className="dashboard-stat-main">

                <span className="dashboard-stat-icon">
                  {stat.icon}
                </span>

                <div className="dashboard-stat-copy">

                  <p className="dashboard-stat-value">
                    {summaryLoading
                      ? '...'
                      : formatCount(stat.value)}
                  </p>

                  <p className="dashboard-stat-label">
                    {stat.label}
                  </p>

                  <p className="dashboard-stat-helper">
                    {stat.helperText}
                  </p>

                </div>

              </div>

              <div className="dashboard-stat-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

            </Link>
          ))}

        </div>

      </section>


      {/* ============================================================
          Discover PMIP
      ============================================================ */}

      <section className="home-section">

        <div className="home-section-heading">

          <div>
            <p className="home-section-kicker">
              Discover
            </p>

            <h2>
              Explore PMIP
            </h2>
          </div>

          <p>
            Explore artists, tracks, releases and country-level
            intelligence across the platform.
          </p>

        </div>

        <div className="home-discovery-grid">

          <Link
            to="/artists"
            className="home-discovery-card"
          >
            <span className="home-discovery-icon">
              ◉
            </span>

            <h3>
              Artists
            </h3>

            <p>
              Search artists and explore profile, momentum and
              growth intelligence.
            </p>

            <span className="home-discovery-link">
              Explore artists →
            </span>
          </Link>

          <Link
            to="/tracks"
            className="home-discovery-card"
          >
            <span className="home-discovery-icon">
              ♫
            </span>

            <h3>
              Tracks
            </h3>

            <p>
              Explore track performance, forecasting and anomaly
              intelligence.
            </p>

            <span className="home-discovery-link">
              Explore tracks →
            </span>
          </Link>

          <Link
            to="/releases"
            className="home-discovery-card"
          >
            <span className="home-discovery-icon">
              ▣
            </span>

            <h3>
              Releases
            </h3>

            <p>
              Review releases, track lists and release-performance
              intelligence.
            </p>

            <span className="home-discovery-link">
              Explore releases →
            </span>
          </Link>

          <Link
            to="/countries"
            className="home-discovery-card"
          >
            <span className="home-discovery-icon">
              ◎
            </span>

            <h3>
              Countries
            </h3>

            <p>
              Explore geographic performance and market-growth
              intelligence.
            </p>

            <span className="home-discovery-link">
              Explore countries →
            </span>
          </Link>

        </div>

      </section>


      {/* ============================================================
          Intelligence overview
      ============================================================ */}

      <section className="home-section">

        <div className="home-section-heading">

          <div>
            <p className="home-section-kicker">
              Intelligence
            </p>

            <h2>
              Understand What the Data Means
            </h2>
          </div>

          <p>
            PMIP combines multiple analytical views to make music
            performance easier to understand.
          </p>

        </div>

        <div className="home-intelligence-grid">

          <article className="home-intelligence-card">

            <span className="home-intelligence-label">
              Momentum
            </span>

            <h3>
              Artist Momentum
            </h3>

            <p>
              Understand how strongly an artist&apos;s recent
              performance is moving.
            </p>

          </article>

          <article className="home-intelligence-card">

            <span className="home-intelligence-label">
              Forecasting
            </span>

            <h3>
              Track Forecasting
            </h3>

            <p>
              Compare predicted streaming performance with
              observed track performance.
            </p>

          </article>

          <article className="home-intelligence-card">

            <span className="home-intelligence-label">
              Anomalies
            </span>

            <h3>
              Streaming Anomalies
            </h3>

            <p>
              Identify unusual streaming behaviour and records
              requiring closer review.
            </p>

          </article>

          <article className="home-intelligence-card">

            <span className="home-intelligence-label">
              Markets
            </span>

            <h3>
              Geographic and Market Growth
            </h3>

            <p>
              Explore country-level performance and emerging
              market signals.
            </p>

          </article>

        </div>

        <div className="home-intelligence-action">

          <Link
            to="/intelligence"
            className="home-primary-action"
          >
            Explore Intelligence
          </Link>

        </div>

      </section>

    </PageContainer>
  );
}


export default HomePage;