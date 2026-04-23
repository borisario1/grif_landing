"use client";

import { FormEvent, useState } from "react";
import { PhoneCall, Search } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import logoWhite from "@/images/logo-paini-white.png";
import quickOrderBg from "@/images/professional-interior_2850587875.jpeg";
import heroImage from "@/images/professional-interior-p_2850587871.jpeg";

export function HeroSection() {
  const c = landingContent.hero;
  const common = landingContent.common;
  const [isQuickOrderOpen, setQuickOrderOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section className="hero" id="top">
        <img className="hero-bg" src={heroImage.src} alt="Кухонный интерьер с продукцией Paini" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-brand">
            <img src={logoWhite.src} alt="Paini white logo" className="logo logo-light" />
          </div>
          <p className="hero-kicker">{c.kicker}</p>
          <h1>{c.title}</h1>
          <p className="hero-subtitle">{c.subtitle}</p>
          <p className="hero-anchors">{c.anchors}</p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary">
              <Search size={16} aria-hidden="true" />
              {c.chooseModel}
            </a>
            <button className="btn btn-secondary" onClick={() => setQuickOrderOpen(true)}>
              <PhoneCall size={16} aria-hidden="true" />
              {common.quickOrder}
            </button>
          </div>
          <p className="hero-micro">{c.micro}</p>
        </div>
      </section>

      {isQuickOrderOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={common.quickOrder} onClick={() => setQuickOrderOpen(false)}>
          <div
            className="modal-card quick-order-modal quick-order-modal-with-bg"
            onClick={(event) => event.stopPropagation()}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.74) 100%), url(${quickOrderBg.src})`,
            }}
          >
            <button className="modal-close" onClick={() => setQuickOrderOpen(false)} aria-label={common.close}>
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
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      placeholder={c.quickOrderModal.phonePlaceholder}
                    />
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
                <button className="btn btn-primary" onClick={() => setQuickOrderOpen(false)}>
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
