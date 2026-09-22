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


function TrackAnomalyChart({ anomalies }) {
  // Prepare chart data
  const chartData = anomalies
    .map((anomaly) => ({
      track:
        anomaly.track_name ||
        `Track ${anomaly.track_id}`,

      anomalyScoreRatio: Number(
        anomaly.anomaly_score_ratio
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.anomalyScoreRatio)
    );


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No track anomaly data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Track Anomaly Strength</h3>

      <p>
        This chart compares the anomaly score ratio across the
        loaded track observations. A higher ratio represents a
        stronger deviation from the behaviour expected by the
        PMIP anomaly-detection model.
      </p>

      <div
        style={{
          width: '100%',
          height: '420px'
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
              left: 140,
              bottom: 55
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              label={{
                value: 'Anomaly Score Ratio',
                position: 'insideBottom',
                offset: -10
              }}
            />

            <YAxis
              type="category"
              dataKey="track"
              width={190}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                'Anomaly Score Ratio'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="anomalyScoreRatio"
              name="Anomaly Score Ratio"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export default TrackAnomalyChart;