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


function MomentumScoreChart({
  artistName,
  score
}) {
  // Prepare chart data
  const numericScore = Number(score);

  if (
    score === null ||
    score === undefined ||
    Number.isNaN(numericScore)
  ) {
    return (
      <p>
        No momentum score is available for this chart.
      </p>
    );
  }

  const chartData = [
    {
      artist: artistName || 'Artist',
      momentumScore: numericScore
    }
  ];


  // Chart
  return (
    <div>
      <h3>Artist Momentum Score</h3>

      <p>
        This chart shows the artist&apos;s current PMIP momentum
        score. A higher score represents stronger momentum based
        on the signals included in the momentum model.
      </p>

      <div
        style={{
          width: '100%',
          height: '280px'
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
              left: 40,
              bottom: 20
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              label={{
                value: 'Momentum Score',
                position: 'insideBottom',
                offset: -5
              }}
            />

            <YAxis
              type="category"
              dataKey="artist"
              width={120}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                'Momentum Score'
              ]}
            />

            <Legend />

            <Bar
              dataKey="momentumScore"
              name="Momentum Score"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MomentumScoreChart;