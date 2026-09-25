import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function CountryMarketGrowthChart({ countries }) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = countries
    .map((country) => ({
      country:
        country.country_name ||
        country.source_country ||
        'Unknown market',

      emergingMarketScore: Number(
        country.emerging_market_score
      ),

      classification:
        country.emerging_market_class ||
        'Not available'
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.emergingMarketScore
        )
    );


  // ============================================================
  // Empty state
  // ============================================================

  if (chartData.length === 0) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No market-growth data is available for this chart.
        </p>
      </div>
    );
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function MarketGrowthTooltip({
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
            item.emergingMarketScore
          ).toFixed(2)}
        </p>

        <span>
          Emerging Market Score
        </span>


        <div className="pmip-chart-tooltip-meta">

          <p>
            Classification:{' '}
            <strong>
              {item.classification}
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
            Market-Growth Visualisation
          </p>

          <h3>
            Emerging Market Growth Potential
          </h3>

          <p className="intelligence-chart-description">
            Compare PMIP&apos;s emerging-market scores across the
            loaded countries to identify markets showing stronger
            growth potential.
          </p>
        </div>

      </div>


      <div className="country-market-growth-chart-container">

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
              domain={[0, 100]}
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
              content={<MarketGrowthTooltip />}
            />


            <Bar
              dataKey="emergingMarketScore"
              name="Emerging Market Score"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={30}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-scale">

        <span>
          0 — Lower Growth Potential
        </span>

        <span>
          100 — Higher Growth Potential
        </span>

      </div>

    </div>
  );
}


export default CountryMarketGrowthChart;