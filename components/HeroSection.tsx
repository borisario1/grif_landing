"use client";

import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import { PhoneCall, Search } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import logoWhite from "@/images/logo-paini-white.png";
import quickOrderBg from "@/images/professional-interior_2850587875.jpeg";
import heroImage from "@/images/professional-interior-p_2850587871.jpeg";

const HERO_PRIMARY_TRANSITION_MS = 900;
const HERO_LABEL_FADE_MS = HERO_PRIMARY_TRANSITION_MS / 2;
const HERO_PRIMARY_PHRASES = [
  "Выбрать своего итальянца",
  "Подобрать смеситель",
  "Выбрать модель",
  "Выбрать модель PAINI",
  "Подобрать модель PAINI",
  "Подобрать сантехнику",
  "Открыть каталог",
  "Онлайн каталог",
  "Смотреть товары",
];
const HERO_PRIMARY_THEMES = [
  {
    id: "dark-navy",
    background: "#071f33",
    borderColor: "rgba(160, 198, 230, 0.5)",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(5, 15, 28, 0.45)",
  },
  {
    id: "sky-blue",
    background: "#2f7eb8",
    borderColor: "rgba(255, 255, 255, 0.55)",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(20, 90, 145, 0.38)",
  },
  {
    id: "blue-white",
    background: "#f0f7fc",
    borderColor: "rgba(12, 74, 110, 0.42)",
    color: "#082f4a",
    boxShadow: "0 12px 28px rgba(8, 47, 74, 0.16)",
  },
  {
    id: "current",
    background: "#1a4a62",
    borderColor: "rgba(189, 210, 226, 0.55)",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(7, 22, 36, 0.38)",
  },
] as const;

const formatRuPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "+7";
  let normalized = digits;
  if (normalized.startsWith("8")) normalized = `7${normalized.slice(1)}`;
  if (!normalized.startsWith("7")) normalized = `7${normalized}`;
  normalized = normalized.slice(0, 11);
  const local = normalized.slice(1);
  const part1 = local.slice(0, 3);
  const part2 = local.slice(3, 6);
  const part3 = local.slice(6, 8);
  const part4 = local.slice(8, 10);
  let out = "+7";
  if (part1) out += ` (${part1}`;
  if (part1.length === 3) out += ")";
  if (part2) out += ` ${part2}`;
  if (part3) out += `-${part3}`;
  if (part4) out += `-${part4}`;
  return out;
};

export function HeroSection() {
  const c = landingContent.hero;
  const common = landingContent.common;
  const [isQuickOrderOpen, setQuickOrderOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isConsentChecked, setConsentChecked] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [isQuickOrderClosing, setQuickOrderClosing] = useState(false);
  const CLOSE_ANIMATION_MS = 180;
  const [heroPrimaryLabel, setHeroPrimaryLabel] = useState(HERO_PRIMARY_PHRASES[0]);
  const [heroPrimaryThemeIndex, setHeroPrimaryThemeIndex] = useState(0);
  const [displayedHeroLabel, setDisplayedHeroLabel] = useState(HERO_PRIMARY_PHRASES[0]);
  const [heroLabelOpacity, setHeroLabelOpacity] = useState(1);
  const labelFadeTimerRef = useRef<number | null>(null);

  const closeQuickOrder = () => {
    setQuickOrderClosing(true);
    window.setTimeout(() => {
      setQuickOrderOpen(false);
      setQuickOrderClosing(false);
      setConsentChecked(false);
    }, CLOSE_ANIMATION_MS);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  useEffect(() => {
    if (heroPrimaryLabel === displayedHeroLabel) return;
    if (labelFadeTimerRef.current) window.clearTimeout(labelFadeTimerRef.current);
    setHeroLabelOpacity(0);
    labelFadeTimerRef.current = window.setTimeout(() => {
      labelFadeTimerRef.current = null;
      setDisplayedHeroLabel(heroPrimaryLabel);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setHeroLabelOpacity(1));
      });
    }, HERO_LABEL_FADE_MS);
    return () => {
      if (labelFadeTimerRef.current) window.clearTimeout(labelFadeTimerRef.current);
    };
  }, [heroPrimaryLabel, displayedHeroLabel]);

  useEffect(() => {
    if (HERO_PRIMARY_PHRASES.length <= 1 && HERO_PRIMARY_THEMES.length <= 1) return;
    const timer = window.setInterval(() => {
      if (HERO_PRIMARY_PHRASES.length > 1) {
        setHeroPrimaryLabel((prev) => {
          const alternatives = HERO_PRIMARY_PHRASES.filter((item) => item !== prev);
          if (!alternatives.length) return prev;
          return alternatives[Math.floor(Math.random() * alternatives.length)];
        });
      }
      if (HERO_PRIMARY_THEMES.length > 1) {
        setHeroPrimaryThemeIndex((prev) => {
          const n = HERO_PRIMARY_THEMES.length;
          const candidates = Array.from({ length: n }, (_, i) => i).filter((i) => i !== prev);
          if (!candidates.length) return prev;
          return candidates[Math.floor(Math.random() * candidates.length)] ?? prev;
        });
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="hero" id="top">
        <img className="hero-bg" src={heroImage.src} alt="Кухонный интерьер с продукцией Paini" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-shell">
            <div className="hero-brand">
              <img src={logoWhite.src} alt="Paini white logo" className="logo logo-light" />
            </div>
            <p className="hero-kicker">{c.kicker}</p>
            <h1>{c.title}</h1>
            <p className="hero-subtitle">{c.subtitle}</p>
            <p className="hero-anchors">{c.anchors}</p>
            <div className="hero-actions">
              <a
                href="#catalog"
                className="btn btn-primary hero-primary-btn"
                style={
                  {
                    "--hero-primary-bg": HERO_PRIMARY_THEMES[heroPrimaryThemeIndex]?.background,
                    "--hero-primary-border": HERO_PRIMARY_THEMES[heroPrimaryThemeIndex]?.borderColor,
                    "--hero-primary-fg": HERO_PRIMARY_THEMES[heroPrimaryThemeIndex]?.color,
                    "--hero-primary-shadow": HERO_PRIMARY_THEMES[heroPrimaryThemeIndex]?.boxShadow,
                    "--hero-label-fade-ms": `${HERO_LABEL_FADE_MS}ms`,
                  } as CSSProperties
                }
              >
                <Search size={16} className="hero-primary-btn-icon" aria-hidden="true" />
                <span className="hero-primary-btn-label" style={{ opacity: heroLabelOpacity }}>
                  {displayedHeroLabel}
                </span>
              </a>
              <button
                className="btn btn-secondary hero-secondary-btn"
                onClick={() => {
                  setQuickOrderClosing(false);
                  setQuickOrderOpen(true);
                }}
              >
                <PhoneCall size={16} aria-hidden="true" />
                {common.quickOrder}
              </button>
            </div>
            <p className="hero-micro">{c.micro}</p>
          </div>
        </div>
      </section>

      {isQuickOrderOpen && (
        <div className={`modal-backdrop ${isQuickOrderClosing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={common.quickOrder} onClick={closeQuickOrder}>
          <div
            className="modal-card quick-order-modal quick-order-modal-with-bg"
            onClick={(event) => event.stopPropagation()}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.96) 100%), url(${quickOrderBg.src})`,
            }}
          >
            <button className="modal-close" onClick={closeQuickOrder} aria-label={common.close}>
              ×
            </button>
            {!isSubmitted ? (
              <>
                <h3>{c.quickOrderModal.title}</h3>
                <p className="quick-order-subtitle">{c.quickOrderModal.subtitle}</p>
                <a className="quick-order-phone" href={c.quickOrderModal.phoneHref}>
                  {c.quickOrderModal.phoneHint}
                </a>
                <form className="quick-order-form" onSubmit={onSubmit}>
                  <label>
                    {c.quickOrderModal.nameLabel}
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      placeholder={c.quickOrderModal.namePlaceholder}
                    />
                  </label>
                  <label>
                    {c.quickOrderModal.phoneLabel}
                    <input
                      value={phone}
                      onChange={(event) => setPhone(formatRuPhone(event.target.value))}
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder={c.quickOrderModal.phonePlaceholder}
                    />
                  </label>
                  <label className="consent-checkbox">
                    <input
                      type="checkbox"
                      checked={isConsentChecked}
                      onChange={(event) => setConsentChecked(event.target.checked)}
                      required
                    />
                    <span>
                      {common.personalDataConsentLabel}{" "}
                      <a href="https://grifmaster.ru/site/pokupatelyam/o-personalnykh-dannykh/" target="_blank" rel="noreferrer">
                        {common.personalDataConsentPolicy}
                      </a>
                    </span>
                  </label>
                  <button className="btn btn-primary" type="submit">
                    {c.quickOrderModal.submit}
                  </button>
                </form>
              </>
            ) : (
              <div className="quick-order-success">
                <h3>{c.quickOrderModal.successTitle}</h3>
                <p>{c.quickOrderModal.successText}</p>
                <button className="btn btn-primary" onClick={closeQuickOrder}>
                  {c.quickOrderModal.successClose}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
