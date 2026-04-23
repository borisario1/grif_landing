import { ArrowUp } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import logoDark from "@/images/logo-paini.png";

export function Footer() {
  const c = landingContent.footer;
  return (
    <footer className="footer">
      <div className="container footer-wrap">
        <div className="footer-main">
          <img src={logoDark.src} alt="Paini logo" className="footer-logo" />
          <h3>{c.title}</h3>
          <p>{c.text}</p>
        </div>
        <div className="footer-actions">
          <a href={c.phoneHref} className="footer-phone">
            {c.phoneLabel}: <strong>{c.phone}</strong>
          </a>
          <a href="#top" className="btn btn-secondary">
            <ArrowUp size={16} aria-hidden="true" />
            {c.toTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
