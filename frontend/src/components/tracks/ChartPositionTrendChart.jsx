import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ChartPositionTrendChart({ data }) {
  // Prepare chart data
  const chartData = data.map((item) => ({
    date: new Date(
      item.observation_date
    ).toLocaleDateString(),

    chartPosition: Number(
      item.chart_position
    )
  }));


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No chart-position data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Chart Position Over Time</h3>

      <p>
        This chart shows how the track&apos;s chart ranking changed
        during the selected historical period. A lower chart
        position is better, so position 1 represents the strongest
        chart ranking.
      </p>

      <div
        style={{
          width: '100%',
          height: '350px'
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 40
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              label={{
                value: 'Observation Date',
                position: 'insideBottom',
                offset: -15
              }}
            />

            <YAxis
              reversed
              allowDecimals={false}
              label={{
                value: 'Chart Position',
                angle: -90,
                position: 'insideLeft'
              }}
            />

            <Tooltip
              formatter={(value) => [
                value,
                'Chart Position'
              ]}
              labelFormatter={(label) =>
                `Date: ${label}`
              }
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Line
              type="monotone"
              dataKey="chartPosition"
              name="Chart Position"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartPositionTrendChart;