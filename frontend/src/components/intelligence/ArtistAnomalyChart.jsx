import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function ArtistAnomalyChart({ artists }) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const chartData = artists
    .map((artist) => ({
      artist:
        artist.artist_name ||
        `Artist ${artist.artist_id}`,

      anomalyCount: Number(
        artist.final_anomaly_count
      ),

      anomalyRate: Number(
        artist.anomaly_rate_pct
      ),

      highPriorityCount: Number(
        artist.high_priority_anomaly_count
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.anomalyCount
        )
    );


  // ============================================================
  // Empty state
  // ============================================================

  if (chartData.length === 0) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No artist anomaly data is available for this chart.
        </p>
      </div>
    );
  }


  // ============================================================
  // Custom tooltip
  // ============================================================

  function ArtistAnomalyTooltip({
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
          {item.artist}
        </p>

        <p className="pmip-chart-tooltip-value">
          {Number(
            item.anomalyCount
          ).toLocaleString()}
        </p>

        <span>
          Detected Anomalies
        </span>


        <div className="pmip-chart-tooltip-meta">

          <p>
            Anomaly Rate:{' '}
            <strong>
              {Number.isNaN(
                item.anomalyRate
              )
                ? 'Not available'
                : `${item.anomalyRate.toFixed(2)}%`}
            </strong>
          </p>

          <p>
            High-Priority:{' '}
            <strong>
              {Number.isNaN(
                item.highPriorityCount
              )
                ? 'Not available'
                : item.highPriorityCount.toLocaleString()}
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
            Artist Anomaly Visualisation
          </p>

          <h3>
            Artist Anomaly Activity
          </h3>

          <p className="intelligence-chart-description">
            Compare the number of unusual observations detected
            across the artists included in the latest intelligence
            results.
          </p>
        </div>

      </div>


      <div className="artist-anomaly-chart-container">

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
              allowDecimals={false}
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
              dataKey="artist"
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
              content={<ArtistAnomalyTooltip />}
            />


            <Bar
              dataKey="anomalyCount"
              name="Detected Anomalies"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={30}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-note">
        Larger values mean PMIP detected more unusual observations
        for that artist within the analysed data.
      </div>

    </div>
  );
}


export default ArtistAnomalyChart;