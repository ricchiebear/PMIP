function SummaryCard({
  label,
  value,
  helperText,
  tone = 'default'
}) {
  // ============================================================
  // Card style
  // ============================================================

  const cardClassName =
    tone === 'highlight'
      ? 'summary-card summary-card-highlight'
      : 'summary-card';


  // ============================================================
  // Card
  // ============================================================

  return (
    <div className={cardClassName}>

      <p className="summary-card-label">
        {label}
      </p>


      <h3 className="summary-card-value">
        {value}
      </h3>


      {helperText && (
        <p className="summary-card-helper">
          {helperText}
        </p>
      )}

    </div>
  );
}


export default SummaryCard;