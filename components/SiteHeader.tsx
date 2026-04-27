"use client";

import { type MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleHelp, ListFilter, Phone, MessageCircle, Truck, Store, Menu, X } from "lucide-react";
import { landingContent } from "@/data/landing-content";

export function SiteHeader() {
  const c = landingContent.header;
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isMenuOpen) root.setAttribute("data-mobile-menu-open", "true");
    else root.removeAttribute("data-mobile-menu-open");
    return () => root.removeAttribute("data-mobile-menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    const handleHashChange = () => setMenuOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const scrollToAnchorWithRetry = (anchorId: string) => {
    const run = () => {
      const target = document.getElementById(anchorId);
      if (!target) return false;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };
    if (run()) return;
    [120, 260, 520, 900].forEach((delay) => {
      window.setTimeout(() => {
        run();
      }, delay);
    });
  };

  const navigateToAnchor = (anchorId: "catalog" | "delivery" | "faq") => {
    setMenuOpen(false);
    const nextUrl = `/#${anchorId}`;
    if (pathname !== "/") {
      router.push(nextUrl, { scroll: false });
      window.setTimeout(() => scrollToAnchorWithRetry(anchorId), 80);
      return;
    }
    window.history.replaceState(window.history.state, "", nextUrl);
    scrollToAnchorWithRetry(anchorId);
  };

  const onLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen(false);
    if (pathname !== "/") {
      router.push("/", { scroll: false });
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
      return;
    }
    window.history.replaceState(window.history.state, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <div className="container site-header-wrap">
        <Link href="/" className="site-brand site-brand-text" aria-label={c.homeAriaLabel} onClick={onLogoClick}>
          <img
            src="https://grifmaster.ru/wa-data/public/site/themes/aheadver1/assets/img/logo.svg"
            alt="Грифмастер"
            className="site-distributor-logo"
          />
        </Link>
        <button
          className="site-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
        <nav className={`site-nav ${isMenuOpen ? "is-open" : ""}`}>
          <a
            href="/#catalog"
            className="site-nav-link"
            onClick={(event) => {
              event.preventDefault();
              navigateToAnchor("catalog");
            }}
          >
            <ListFilter size={15} aria-hidden="true" />
            {c.nav.catalog}
          </a>
          <a
            href="/#delivery"
            className="site-nav-link"
            onClick={(event) => {
              event.preventDefault();
              navigateToAnchor("delivery");
            }}
          >
            <Truck size={15} aria-hidden="true" />
            {c.nav.delivery}
          </a>
          <a href="https://grifmaster.ru/showroom" target="_blank" rel="noreferrer" className="site-nav-link" onClick={() => setMenuOpen(false)}>
            <Store size={15} aria-hidden="true" />
            {c.nav.showroom}
          </a>
          <a
            href="/#faq"
            className="site-nav-link"
            onClick={(event) => {
              event.preventDefault();
              navigateToAnchor("faq");
            }}
          >
            <CircleHelp size={15} aria-hidden="true" />
            {c.nav.faq}
          </a>
        </nav>
        <div className="site-header-actions">
          <a href={c.phoneHref} className="site-phone">
            <Phone size={15} aria-hidden="true" />
            {c.phone}
          </a>
          <a href={c.phoneHref} className="btn btn-primary site-quick-btn">
            <MessageCircle size={15} aria-hidden="true" />
            {c.catalogCta}
          </a>
        </div>
      </div>
      <div className="site-header-border">
        <div className="container" />
      </div>
    </header>
  );
}
