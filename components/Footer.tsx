import { ArrowUp } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import logoDark from "@/images/logo-paini.png";

export function Footer() {
  const c = landingContent.footer;
  const inn = c.innKpp.split("/")[0]?.trim() ?? c.innKpp;
  return (
    <footer className="footer">
      <section className="footer-links-band">
        <div className="container footer-links-grid">
          <article className="footer-links-group">
            <h4>{c.proofLinksTitle}</h4>
            <ul>
              {c.proofLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "_blank"}
                    rel={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "noreferrer"}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
          <article className="footer-links-group">
            <h4>{c.expertLinksTitle}</h4>
            <ul>
              {c.expertLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "_blank"}
                    rel={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "noreferrer"}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
          <article className="footer-links-group">
            <h4>{c.partnerLinksTitle}</h4>
            <ul>
              {c.partnerLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "_blank"}
                    rel={item.href.startsWith("/") || item.href.startsWith("#") ? undefined : "noreferrer"}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
      <div className="container footer-wrap">
        <section className="footer-main">
          <img src={logoDark.src} alt="Paini logo" className="footer-logo" />
          <p>{c.text}</p>
          <p className="footer-address">{c.address}</p>
        </section>

        <section className="footer-actions">
          <a href={c.phoneHref} className="footer-phone">
            <span>{c.phoneLabel}</span>
            <strong>{c.phone}</strong>
          </a>
          <div className="footer-emails">
            <a href={`mailto:${c.emailInfo}`} className="footer-email-link">
              {c.emailInfo}
            </a>
            <span>{c.emailInfoLabel}</span>
            <a href={`mailto:${c.emailService}`} className="footer-email-link">
              {c.emailService}
            </a>
            <span>{c.emailServiceLabel}</span>
          </div>
        </section>
      </div>
      <div className="container footer-legal">
        <div className="footer-legal-company">
          <span className="footer-company-meta">
            {c.companyShortName} · ИНН {inn}
          </span>
          <span>{c.copyright}</span>
        </div>
        <div className="footer-legal-links">
          <a href={c.sitemapHref}>
            {c.sitemapLabel}
          </a>
          <a href={c.policyHref} target="_blank" rel="noreferrer">
            {c.policyLabel}
          </a>
        </div>
      </div>
      <a href="#top" className="to-top-floating" aria-label={c.toTop} title={c.toTop}>
        <ArrowUp size={18} aria-hidden="true" />
      </a>
    </footer>
  );
}
