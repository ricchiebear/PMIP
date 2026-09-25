import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function TrackAnomalyChart({ anomalies }) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = anomalies
    .map((anomaly) => ({
      track:
        anomaly.track_name ||
        `Track ${anomaly.track_id}`,

      anomalyScoreRatio: Number(
        anomaly.anomaly_score_ratio
      ),

      severity:
        anomaly.anomaly_severity ||
        'Not available',

      direction:
        anomaly.anomaly_direction ||
        'Not available'
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.anomalyScoreRatio
        )
    );


  // ============================================================
  // Empty state
  // ============================================================

  if (chartData.length === 0) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No track anomaly data is available for this chart.
        </p>
      </div>
    );
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function TrackAnomalyTooltip({
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
          {item.track}
        </p>

        <p className="pmip-chart-tooltip-value">
          {Number(
            item.anomalyScoreRatio
          ).toFixed(2)}
        </p>

        <span>
          Anomaly Score Ratio
        </span>

        <div className="pmip-chart-tooltip-meta">
          <p>
            Severity:{' '}
            <strong>
              {item.severity}
            </strong>
          </p>

          <p>
            Direction:{' '}
            <strong>
              {item.direction}
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
            Anomaly Visualisation
          </p>

          <h3>
            Track Anomaly Strength
          </h3>

          <p className="intelligence-chart-description">
            Compare how strongly each observation deviates from
            the behaviour expected by PMIP&apos;s anomaly-detection
            intelligence.
          </p>
        </div>

      </div>


      <div className="track-anomaly-chart-container">

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
              dataKey="track"
              width={170}
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
              content={<TrackAnomalyTooltip />}
            />


            <Bar
              dataKey="anomalyScoreRatio"
              name="Anomaly Score Ratio"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={30}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-note">
        Higher values indicate a stronger departure from the
        behaviour expected by the anomaly-detection model.
      </div>

    </div>
  );
}


export default TrackAnomalyChart;