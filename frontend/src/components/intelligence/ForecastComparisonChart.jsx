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


function ForecastComparisonChart({
  trackName,
  predictedStreams,
  actualStreams
}) {
  // Prepare values
  const predicted = Number(predictedStreams);
  const actual = Number(actualStreams);

  if (
    Number.isNaN(predicted) ||
    Number.isNaN(actual)
  ) {
    return (
      <p>
        Forecast comparison data is not available for this chart.
      </p>
    );
  }


  // Prepare chart data
  const chartData = [
    {
      type: 'Predicted',
      streams: predicted
    },
    {
      type: 'Actual',
      streams: actual
    }
  ];


  // Format large stream values
  function formatCompactNumber(value) {
    return new Intl.NumberFormat('en-GB', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(Number(value));
  }


  // Chart
  return (
    <div>
      <h3>Predicted vs Actual Spotify Streams</h3>

      <p>
        This chart compares PMIP&apos;s predicted Spotify stream
        total with the observed stream total for{' '}
        {trackName || 'the selected track'}.
      </p>

      <div
        style={{
          width: '100%',
          height: '380px'
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 70,
              bottom: 50
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="type"
              label={{
                value: 'Forecast Comparison',
                position: 'insideBottom',
                offset: -20
              }}
            />

            <YAxis
              width={90}
              tickFormatter={formatCompactNumber}
              label={{
                value: 'Spotify Streams',
                angle: -90,
                position: 'insideLeft',
                offset: -50
              }}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(),
                'Spotify Streams'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="streams"
              name="Spotify Streams"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastComparisonChart;