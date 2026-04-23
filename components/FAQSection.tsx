import { landingContent } from "@/data/landing-content";

export function FAQSection() {
  const c = landingContent.faq;
  return (
    <section className="section" id="faq">
      <div className="container">
        <h2>{c.title}</h2>
        <div className="faq-grid">
          {c.items.map((item) => (
            <article key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
