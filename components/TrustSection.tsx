import cdek from "@/images/cdek.jpg";
import paykeeper from "@/images/paykeeper.png";
import { landingContent } from "@/data/landing-content";

export function TrustSection() {
  const c = landingContent.trust;
  return (
    <section className="section section-muted" id="trust">
      <div className="container">
        <h2>{c.title}</h2>
        <p className="section-lead">{c.lead}</p>
        <div className="trust-grid">
          <article className="trust-card">
            <h3>{c.paymentTitle}</h3>
            <img src={paykeeper.src} alt="Paykeeper" />
            <p>{c.paymentText}</p>
          </article>
          <article className="trust-card">
            <h3>{c.deliveryTitle}</h3>
            <img src={cdek.src} alt="СДЭК" />
            <p>{c.deliveryText}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
