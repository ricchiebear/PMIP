function ContentSection({
  title,
  description,
  eyebrow,
  variant = 'default',
  children
}) {
  const sectionClassName =
    variant === 'intelligence'
      ? 'content-section intelligence-section'
      : 'content-section';

  return (
    <section className={sectionClassName}>

      <header className="content-section-header">

        <div className="content-section-heading">

          {eyebrow && (
            <p className="content-section-eyebrow">
              {eyebrow}
            </p>
          )}

          <h2>
            {title}
          </h2>

          {description && (
            <p className="content-section-description">
              {description}
            </p>
          )}

        </div>

      </header>


      <div className="content-section-body">
        {children}
      </div>

    </section>
  );
}

export default ContentSection;