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


function CountryGeographicChart({ countries }) {
  // Prepare chart data
  const chartData = countries
    .map((country) => ({
      country: country.country_name,
      findingsIndex: Number(
        country.country_findings_index
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.findingsIndex)
    );


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No geographic performance data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Country Geographic Strength</h3>

      <p>
        This chart compares the PMIP country findings index across
        the loaded markets. A higher findings index represents a
        stronger overall geographic market signal.
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
              domain={[0, 1]}
              label={{
                value: 'Country Findings Index',
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
                Number(value).toFixed(4),
                'Country Findings Index'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="findingsIndex"
              name="Country Findings Index"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CountryGeographicChart;