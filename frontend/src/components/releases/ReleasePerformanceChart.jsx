import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function ReleasePerformanceChart({ performance }) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = performance
    .map((item) => ({
      track:
        item.track_name ||
        `Track ${item.track_id}`,

      compositeScore: Number(
        item.composite_release_performance_score
      ),

      performanceClass:
        item.release_performance_class ||
        'Unavailable',

      priority:
        item.release_priority_class ||
        'Unavailable'
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.compositeScore
        )
    );


  // ============================================================
  // Empty state
  // ============================================================

  if (chartData.length === 0) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No release-performance data is available for this chart.
        </p>
      </div>
    );
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function ReleasePerformanceTooltip({
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
            item.compositeScore
          ).toFixed(2)}
        </p>

        <span>
          Composite Performance Score
        </span>


        <div className="pmip-chart-tooltip-meta">

          <p>
            Performance Class:{' '}
            <strong>
              {item.performanceClass}
            </strong>
          </p>

          <p>
            Priority:{' '}
            <strong>
              {item.priority}
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
            Release Performance Visualisation
          </p>

          <h3>
            Track Release Performance Comparison
          </h3>

          <p className="intelligence-chart-description">
            Compare the composite release-performance score for
            each track connected to the selected release.
          </p>
        </div>

      </div>


      <div className="release-performance-chart-container">

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
              dataKey="track"
              width={180}
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
              content={
                <ReleasePerformanceTooltip />
              }
            />


            <Bar
              dataKey="compositeScore"
              name="Composite Performance Score"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={30}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-scale">

        <span>
          0 — Lower Release Performance
        </span>

        <span>
          100 — Higher Release Performance
        </span>

      </div>

    </div>
  );
}


export default ReleasePerformanceChart;