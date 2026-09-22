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


function ReleasePerformanceChart({ performance }) {
  // Prepare chart data
  const chartData = performance
    .map((item) => ({
      track:
        item.track_name ||
        `Track ${item.track_id}`,

      compositeScore: Number(
        item.composite_release_performance_score
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.compositeScore)
    );


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No release-performance data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Track Release Performance Comparison</h3>

      <p>
        This chart compares the composite release-performance
        score for each track connected to the selected release.
        A higher score represents stronger overall release
        performance.
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
              left: 120,
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
                value: 'Composite Release Performance Score',
                position: 'insideBottom',
                offset: -10
              }}
            />

            <YAxis
              type="category"
              dataKey="track"
              width={180}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                'Composite Performance Score'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="compositeScore"
              name="Composite Performance Score"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReleasePerformanceChart;