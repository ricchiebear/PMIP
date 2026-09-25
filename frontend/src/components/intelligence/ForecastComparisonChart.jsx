import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function ForecastComparisonChart({
  trackName,
  predictedStreams,
  actualStreams
}) {
  // ============================================================
  // Prepare values
  // ============================================================

  const predicted = Number(predictedStreams);
  const actual = Number(actualStreams);

  if (
    Number.isNaN(predicted) ||
    Number.isNaN(actual)
  ) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          Forecast comparison data is not available for this track.
        </p>
      </div>
    );
  }


  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = [
    {
      type: 'Predicted',
      predicted,
      actual: null
    },
    {
      type: 'Actual',
      predicted: null,
      actual
    }
  ];


  // ============================================================
  // Format large values
  // ============================================================

  function formatCompactNumber(value) {
    return new Intl.NumberFormat(
      'en-GB',
      {
        notation: 'compact',
        maximumFractionDigits: 1
      }
    ).format(Number(value));
  }


  function formatFullNumber(value) {
    return Number(value).toLocaleString(
      'en-GB',
      {
        maximumFractionDigits: 0
      }
    );
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function ForecastTooltip({
    active,
    payload,
    label
  }) {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const validEntry =
      payload.find(
        (entry) =>
          entry.value !== null &&
          entry.value !== undefined
      );

    if (!validEntry) {
      return null;
    }

    return (
      <div className="pmip-chart-tooltip">

        <p className="pmip-chart-tooltip-label">
          {trackName || 'Selected track'}
        </p>

        <span className="pmip-chart-tooltip-category">
          {label}
        </span>

        <p className="pmip-chart-tooltip-value">
          {formatFullNumber(
            validEntry.value
          )}
        </p>

        <span>
          Spotify Streams
        </span>

      </div>
    );
  }


  // ============================================================
  // Difference
  // ============================================================

  const difference =
    Math.abs(
      actual - predicted
    );


  // ============================================================
  // Chart
  // ============================================================

  return (
    <div className="intelligence-chart-card">

      <div className="intelligence-chart-header">

        <div>
          <p className="intelligence-chart-kicker">
            Forecast Visualisation
          </p>

          <h3>
            Predicted vs Actual Spotify Streams
          </h3>

          <p className="intelligence-chart-description">
            Compare PMIP&apos;s predicted stream total with the
            observed performance for{' '}
            {trackName || 'the selected track'}.
          </p>
        </div>


        <div className="intelligence-chart-score forecast-difference-card">

          <span>
            Difference
          </span>

          <strong>
            {formatCompactNumber(
              difference
            )}
          </strong>

          <small>
            streams
          </small>

        </div>

      </div>


      <div className="forecast-chart-legend">

        <div className="forecast-legend-item">
          <span className="forecast-legend-dot forecast-legend-predicted" />

          <span>
            Predicted Streams
          </span>
        </div>

        <div className="forecast-legend-item">
          <span className="forecast-legend-dot forecast-legend-actual" />

          <span>
            Actual Streams
          </span>
        </div>

      </div>


      <div className="forecast-chart-container">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 10
            }}
          >

            <CartesianGrid
              stroke="#334155"
              strokeDasharray="3 3"
              vertical={false}
            />


            <XAxis
              dataKey="type"
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
              width={72}
              tickFormatter={
                formatCompactNumber
              }
              tick={{
                fill: '#9CA3AF',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />


            <Tooltip
              cursor={{
                fill: 'rgba(124, 58, 237, 0.06)'
              }}
              content={<ForecastTooltip />}
            />


            <Bar
              dataKey="predicted"
              name="Predicted Streams"
              fill="#7C3AED"
              radius={[8, 8, 0, 0]}
              barSize={80}
            />


            <Bar
              dataKey="actual"
              name="Actual Streams"
              fill="#A855F7"
              radius={[8, 8, 0, 0]}
              barSize={80}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}


export default ForecastComparisonChart;