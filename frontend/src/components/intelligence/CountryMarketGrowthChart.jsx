import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


function CountryMarketGrowthChart({ countries }) {
  // Prepare chart data
  const chartData = countries
    .map((country) => ({
      country: country.country_name,
      emergingMarketScore: Number(
        country.emerging_market_score
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.emergingMarketScore)
    );


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No market-growth data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Emerging Market Growth Potential</h3>

      <p>
        This chart compares PMIP&apos;s emerging-market scores
        across the loaded countries. A higher score represents
        stronger emerging-market growth potential.
      </p>

      <div
        style={{
          width: '100%',
          height: '400px'
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 50,
              bottom: 55
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              label={{
                value: 'Emerging Market Score',
                position: 'insideBottom',
                offset: -10
              }}
            />

            <YAxis
              type="category"
              dataKey="country"
              width={100}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                'Emerging Market Score'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="emergingMarketScore"
              name="Emerging Market Score"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CountryMarketGrowthChart;