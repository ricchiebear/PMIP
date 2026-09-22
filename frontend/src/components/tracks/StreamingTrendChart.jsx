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

function StreamingTrendChart({ data }) {
  // Prepare chart data
  const chartData = data.map((item) => ({
    date: new Date(
      item.observation_date
    ).toLocaleDateString(),

    streams: Number(
      item.streams
    )
  }));


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No streaming data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Streaming Performance Over Time</h3>

      <p>
        This chart shows how the track&apos;s streaming
        activity changed across the selected historical period.
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
              tickFormatter={(value) =>
                Number(value).toLocaleString()
              }
              label={{
                value: 'Streams',
                angle: -90,
                position: 'insideLeft'
              }}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(),
                'Streams'
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
              dataKey="streams"
              name="Streams"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StreamingTrendChart;