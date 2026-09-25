import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


function MomentumScoreChart({
  artistName,
  score
}) {
  // ============================================================
  // Prepare chart data
  // ============================================================

  const numericScore = Number(score);

  if (
    score === null ||
    score === undefined ||
    Number.isNaN(numericScore)
  ) {
    return (
      <div className="intelligence-chart-empty">
        <p>
          No momentum score is available for this artist.
        </p>
      </div>
    );
  }


  const chartData = [
    {
      artist: artistName || 'Artist',
      momentumScore: numericScore
    }
  ];


  // ============================================================
  // Custom tooltip
  // ============================================================

  function MomentumTooltip({
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

    const value =
      Number(
        payload[0]?.value
      );

    return (
      <div className="pmip-chart-tooltip">

        <p className="pmip-chart-tooltip-label">
          {artistName || 'Artist'}
        </p>

        <p className="pmip-chart-tooltip-value">
          {Number.isNaN(value)
            ? 'Not available'
            : value.toFixed(2)}
        </p>

        <span>
          Momentum Score
        </span>

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
            Momentum Visualisation
          </p>

          <h3>
            Artist Momentum Score
          </h3>

          <p className="intelligence-chart-description">
            A higher score represents stronger momentum across
            the signals analysed by PMIP.
          </p>
        </div>


        <div className="intelligence-chart-score">

          <span>
            Score
          </span>

          <strong>
            {numericScore.toFixed(2)}
          </strong>

          <small>
            / 100
          </small>

        </div>

      </div>


      <div className="momentum-chart-container">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 18,
              right: 24,
              left: 10,
              bottom: 10
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
              dataKey="artist"
              width={120}
              tick={{
                fill: '#FFFFFF',
                fontSize: 13
              }}
              axisLine={false}
              tickLine={false}
            />


            <Tooltip
              cursor={{
                fill: 'rgba(124, 58, 237, 0.08)'
              }}
              content={<MomentumTooltip />}
            />


            <Bar
              dataKey="momentumScore"
              name="Momentum Score"
              fill="#7C3AED"
              radius={[0, 8, 8, 0]}
              barSize={34}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>


      <div className="intelligence-chart-scale">

        <span>
          0 — Lower Momentum
        </span>

        <span>
          100 — Higher Momentum
        </span>

      </div>

    </div>
  );
}


export default MomentumScoreChart;