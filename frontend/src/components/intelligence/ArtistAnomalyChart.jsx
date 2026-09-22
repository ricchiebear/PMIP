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


function ArtistAnomalyChart({ artists }) {
  // Prepare chart data
  const chartData = artists
    .map((artist) => ({
      artist:
        artist.artist_name ||
        `Artist ${artist.artist_id}`,

      anomalyCount: Number(
        artist.final_anomaly_count
      )
    }))
    .filter(
      (item) =>
        !Number.isNaN(item.anomalyCount)
    );


  // Empty state
  if (chartData.length === 0) {
    return (
      <p>
        No artist anomaly data is available for this chart.
      </p>
    );
  }


  // Chart
  return (
    <div>
      <h3>Artist Anomaly Activity</h3>

      <p>
        This chart compares the number of detected anomalous
        observations across the loaded artists. A larger bar means
        PMIP detected more unusual observations for that artist.
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
              left: 120,
              bottom: 55
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              allowDecimals={false}
              label={{
                value: 'Detected Anomalies',
                position: 'insideBottom',
                offset: -10
              }}
            />

            <YAxis
              type="category"
              dataKey="artist"
              width={170}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(),
                'Detected Anomalies'
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
            />

            <Bar
              dataKey="anomalyCount"
              name="Detected Anomalies"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export default ArtistAnomalyChart;