import Link from "next/link";
import { CircleHelp, ListFilter, Phone, Search, ChevronUp } from "lucide-react";
import { landingContent } from "@/data/landing-content";

export function SiteHeader() {
  const c = landingContent.header;
  return (
    <header className="site-header">
      <div className="container site-header-wrap">
        <Link href="/" className="site-brand site-brand-text" aria-label={c.homeAriaLabel}>
          <img
            src="https://grifmaster.ru/wa-data/public/site/themes/aheadver1/assets/img/logo.svg"
            alt="Грифмастер"
            className="site-distributor-logo"
          />
          <span>официальный дистрибьютор PAINI</span>
        </Link>
        <nav className="site-nav">
          <Link href="/#catalog" className="site-nav-link">
            <ListFilter size={15} aria-hidden="true" />
            {c.nav.catalog}
          </Link>
          <Link href="/#faq" className="site-nav-link">
            <CircleHelp size={15} aria-hidden="true" />
            {c.nav.faq}
          </Link>
          <Link href="/#top" className="site-nav-link">
            <ChevronUp size={15} aria-hidden="true" />
            {c.nav.top}
          </Link>
        </nav>
        <div className="site-header-actions">
          <a href={c.phoneHref} className="site-phone">
            <Phone size={15} aria-hidden="true" />
            {c.phone}
          </a>
          <Link href="/#catalog" className="btn btn-primary site-quick-btn">
            <Search size={15} aria-hidden="true" />
            {c.catalogCta}
          </Link>
        </div>
      </div>
      <div className="site-header-border">
        <div className="container" />
      </div>
    </header>
  );
}
