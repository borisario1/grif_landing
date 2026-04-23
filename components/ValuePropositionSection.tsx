import { landingContent } from "@/data/landing-content";

export function ValuePropositionSection() {
  const c = landingContent.valueProposition;
  return (
    <section className="section section-muted" id="benefits">
      <div className="container">
        <h2>{c.title}</h2>
        <p className="section-lead">{c.lead}</p>
        <div className="grid-3">
          {c.points.map((point) => (
            <article key={point.title} className="card">
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
