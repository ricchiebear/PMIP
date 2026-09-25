import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function CountryGeographicChart({ countries }) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = countries
    .map((country) => ({
      country:
        country.country_name ||
        country.source_country ||
        'Unknown market',

      findingsIndex: Number(
        country.country_findings_index
      ),

      classification:
        country.country_findings_class ||
        'Not available',

      totalStreams: Number(
        country.total_streams
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.findingsIndex
        )
    );


  // ============================================================
  // Empty state
  // ============================================================

  if (chartData.length === 0) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No geographic performance data is available for this chart.
        </p>
      </div>
    );
  }


  // ============================================================
  // Number formatter
  // ============================================================

  function formatCompactNumber(value) {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return 'Not available';
    }

    return new Intl.NumberFormat(
      'en-GB',
      {
        notation: 'compact',
        maximumFractionDigits: 1
      }
    ).format(Number(value));
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function GeographicTooltip({
    active,
    payload
  }) {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const item =
      payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div className="pmip-chart-tooltip">

        <p className="pmip-chart-tooltip-label">
          {item.country}
        </p>

        <p className="pmip-chart-tooltip-value">
          {Number(
            item.findingsIndex
          ).toFixed(4)}
        </p>

        <span>
          Geographic Strength Index
        </span>


        <div className="pmip-chart-tooltip-meta">

          <p>
            Classification:{' '}
            <strong>
              {item.classification}
            </strong>
          </p>

          <p>
            Total Streams:{' '}
            <strong>
              {formatCompactNumber(
                item.totalStreams
              )}
            </strong>
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // Chart
  // ============================================================

  return (
    <div className="intelligence-chart-card">

      <div className="intelligence-chart-header">

        <div>
          <p className="intelligence-chart-kicker">
            Geographic Visualisation
          </p>

          <h3>
            Country Geographic Strength
          </h3>

          <p className="intelligence-chart-description">
            Compare the overall geographic strength of markets
            using PMIP&apos;s country findings index.
          </p>
        </div>

      </div>


      <div className="country-geographic-chart-container">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 16,
              right: 24,
              left: 20,
              bottom: 16
            }}
          >

            <CartesianGrid
              stroke="#334155"
              strokeDasharray="3 3"
              horizontal={false}
            />


            <XAxis
              type="number"
              domain={[0, 1]}
              tick={{
                fill: '#9CA3AF',
                fontSize: 12
              }}
              axisLine={{
                stroke: '#334155'
              }}
              tickLine={false}
            />


            <YAxis
              type="category"
              dataKey="country"
              width={130}
              tick={{
                fill: '#FFFFFF',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />


            <Tooltip
              cursor={{
                fill: 'rgba(124, 58, 237, 0.06)'
              }}
              content={<GeographicTooltip />}
            />


            <Bar
              dataKey="findingsIndex"
              name="Geographic Strength"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={30}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-scale">

        <span>
          0 — Lower Geographic Strength
        </span>

        <span>
          1 — Higher Geographic Strength
        </span>

      </div>

    </div>
  );
}


export default CountryGeographicChart;