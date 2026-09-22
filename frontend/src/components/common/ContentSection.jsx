function ContentSection({ title, children }) {
  return (
    <section className="content-section">
      <h2>{title}</h2>

      <div className="content-section-body">
        {children}
      </div>
    </section>
  );
}

export default ContentSection;