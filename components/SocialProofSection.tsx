"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { landingContent } from "@/data/landing-content";

type SocialProofSectionProps = {
  maxSaving: number;
};

const formatAmount = (amount: number) =>
  Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(amount);

export function SocialProofSection({ maxSaving }: SocialProofSectionProps) {
  const c = landingContent.socialProof;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let animationFrame = 0;
    let start = 0;
    const duration = 1400;

    const run = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const normalized = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - normalized, 3);
      setProgress(eased);
      if (normalized < 1) {
        animationFrame = requestAnimationFrame(run);
      }
    };

    animationFrame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView]);

  const cards = useMemo(
    () => [
      {
        key: "service_life",
        icon: <Timer size={18} aria-hidden="true" />,
        label: c.items[0],
        value: `${Math.round(25 * progress)} лет`,
      },
      {
        key: "warranty",
        icon: <ShieldCheck size={18} aria-hidden="true" />,
        label: c.items[1],
        value: `до ${Math.round(10 * progress)} лет`,
      },
      {
        key: "support",
        icon: <Clock3 size={18} aria-hidden="true" />,
        label: c.items[2],
        value: `${Math.round(24 * progress)}/7`,
      },
      {
        key: "saving",
        icon: <Sparkles size={18} aria-hidden="true" />,
        label: c.items[3],
        value: `до ${formatAmount(Math.round(maxSaving * progress))} ₽`,
      },
    ],
    [c.items, maxSaving, progress],
  );

  return (
    <section className="section" id="proof" ref={sectionRef}>
      <div className="container">
        <h2>{c.title}</h2>
        <div className="proof-grid">
          {cards.map((card) => (
            <article key={card.key} className="proof-item">
              <div className="proof-icon">{card.icon}</div>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
