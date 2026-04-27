import { landingContent } from "@/data/landing-content";

export function Stage2HooksSection() {
  const c = landingContent.stage2;
  return (
    <section className="section" id="stage2">
      <div className="container">
        <h2>{c.title}</h2>
        <p className="section-lead">{c.lead}</p>
        <div className="hooks-grid">
          {c.items.map((hook) => (
            <article key={hook.id} className="hook-card" data-hook-id={hook.id}>
              <h3>{hook.title}</h3>
              <p>{hook.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
