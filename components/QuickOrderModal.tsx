"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, PackageCheck, Ruler, Store, Truck } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import quickOrderBg from "@/images/professional-interior_2850587875.jpeg";
import cdek from "@/images/cdek.jpg";
import { ProductItem } from "@/types/product";

const generalPhrases = [
  "Сделано в Италии",
  "Корпус из цельной латуни",
  "Поставщик с 2008 года",
  "Прямо с фабрики в Новаре",
  "Служит 25 лет",
  "Паспорт изделия в каждой коробке",
  "Декларация ЕАЭС",
  "Товар сертифицирован",
  "Авторизованный сервис в России",
  "Цена как в 2021 году",
  "Количество ограничено!",
  "Еще есть на складе",
  "Перезвоним за 15 минут",
  "Доставка СДЭК по всей России",
  "Оплата картой, СБП или по счёту",
  "Картридж Nuovo Galatron",
  "Аэратор Neoperl",
  "Экономия воды",
  "Покрытие держит цвет",
  "Подойдет в любую столешницу",
  "Легко мыть",
  "Гибкая подводка в комплекте",
];

const DRIFT_COLORS = ["#1B4F8A", "#C47B2B", "#5BB3E8", "#0F4C81", "#4A4A8A"] as const;

const MAX_PRODUCT_PHRASE_LEN = 72;

const formatAmount = (amount: number) => Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount);
const formatWeight = (weightKg: number) => Intl.NumberFormat("ru-RU", { minimumFractionDigits: weightKg < 10 ? 2 : 1, maximumFractionDigits: 2 }).format(weightKg);
const APPROX_GROSS_WEIGHT_KG = 1.2;

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

const buildDisplayName = (name: string, sku: string) => {
  const escapedSku = sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const trimmed = name.trim();
  const exactRemoved = trimmed.replace(new RegExp(`^\\s*${escapedSku}(?:\\s+|\\s*[-:|/]\\s*)?`, "i"), "").trim();
  if (exactRemoved && exactRemoved !== trimmed) return exactRemoved;
  const tokenMatch = trimmed.match(/^([A-Za-z0-9/-]{5,})\s+(.+)$/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const rest = tokenMatch[2]?.trim();
    if (rest && /\d/.test(token) && /[A-Za-z]/.test(token)) return rest;
  }
  return trimmed;
};

const parseWeightKg = (product: ProductItem) => {
  const source = [...product.keyFeatures, ...product.features].find((feature) => feature.name.toLowerCase().includes("вес"));
  if (!source) return null;
  const normalized = source.value.toLowerCase().replace(",", ".").trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  if (normalized.includes("кг")) return numeric;
  if (normalized.includes("г")) return numeric / 1000;
  return numeric;
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function seededUnit(seed: number, salt: number): number {
  const x = Math.sin(seed * 0.0001 + salt * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function shuffleStrings(arr: string[], seed: number): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededUnit(seed, i * 7919) * (i + 1));
    const t = a[i];
    a[i] = a[j]!;
    a[j] = t!;
  }
  return a;
}

function clampPhraseLen(line: string): string {
  const t = line.trim();
  if (t.length <= MAX_PRODUCT_PHRASE_LEN) return t;
  return `${t.slice(0, MAX_PRODUCT_PHRASE_LEN - 1)}…`;
}

function buildProductPhrases(product: ProductItem): string[] {
  const raw: string[] = [];
  if (product.brand?.trim()) raw.push(product.brand.trim());
  if (product.category?.trim()) raw.push(product.category.trim());
  if (product.usageType?.trim()) raw.push(product.usageType.trim());
  if (product.color?.trim()) raw.push(`Оттенок: ${product.color.trim()}`);
  product.keyFeatures.slice(0, 8).forEach((f) => {
    const line = `${f.name}: ${f.value}`.trim();
    if (line) raw.push(line);
  });
  product.features.slice(0, 12).forEach((f) => {
    const line = `${f.name}: ${f.value}`.trim();
    if (line) raw.push(line);
  });
  product.topBenefits?.forEach((b) => {
    if (b?.trim()) raw.push(b.trim());
  });
  if (product.discountPercent > 0) {
    raw.push(`Выгода ${product.discountPercent}%`);
  }
  raw.push(`От ${formatAmount(product.newPrice.amount)} ${product.newPrice.currency}`);
  if (product.saving > 0) {
    raw.push(`Экономия ${formatAmount(product.saving)} ₽`);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw) {
    const c = clampPhraseLen(line);
    if (!c) continue;
    const k = c.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

type QuickOrderTypographicDriftProps = {
  phrases: string[];
  seed: number;
  isPaused: boolean;
};

type DriftRowConfig = {
  id: string;
  dir: "left" | "right";
  sizeMin: number;
  sizeMax: number;
  oMin: number;
  oMax: number;
  duration: number;
  delay: number;
  z: number;
};

/** Порядок: левый мелкий → правый крупный призрак → левый средний → правый ещё крупнее и медленнее → левый задний. */
const DRIFT_ROWS: DriftRowConfig[] = [
  { id: "l1", dir: "left", sizeMin: 13, sizeMax: 15, oMin: 0.75, oMax: 1.0, duration: 250, delay: -30, z: 5 },
  { id: "r1", dir: "right", sizeMin: 24, sizeMax: 32, oMin: 0.03, oMax: 0.09, duration: 520, delay: -48, z: 4 },
  { id: "l2", dir: "left", sizeMin: 18, sizeMax: 22, oMin: 0.2, oMax: 0.35, duration: 620, delay: -140, z: 3 },
  { id: "r2", dir: "right", sizeMin: 32, sizeMax: 44, oMin: 0.015, oMax: 0.055, duration: 1100, delay: -210, z: 2 },
  { id: "l3", dir: "left", sizeMin: 28, sizeMax: 36, oMin: 0.05, oMax: 0.1, duration: 600, delay: -170, z: 1 },
];

function driftRowSalt(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) {
    s += id.charCodeAt(i) * (i + 1);
  }
  return s;
}

function QuickOrderTypographicDrift({ phrases, seed, isPaused }: QuickOrderTypographicDriftProps) {
  const cycle = phrases.length ? phrases : generalPhrases;
  const rows = useMemo(() => {
    return DRIFT_ROWS.map((row) => {
      const rs = driftRowSalt(row.id);
      const opacity = row.oMin + seededUnit(seed, rs * 997) * (row.oMax - row.oMin);
      const items = cycle.map((text, i) => ({
        text,
        color: DRIFT_COLORS[Math.min(DRIFT_COLORS.length - 1, Math.floor(seededUnit(seed, i * 31 + rs * 127) * DRIFT_COLORS.length))],
        fontSizePx: row.sizeMin + Math.floor(seededUnit(seed, i * 53 + rs * 211) * (row.sizeMax - row.sizeMin + 1)),
      }));
      return { ...row, opacity, items };
    });
  }, [cycle, seed]);

  return (
    <div className="quick-order-typographic-drift" aria-hidden="true">
      {rows.map((row) => (
        <div key={row.id} className="quick-order-marquee-layer" style={{ opacity: row.opacity, zIndex: row.z }}>
          <div
            className={`quick-order-marquee-track quick-order-marquee-track--${row.dir}${isPaused ? " is-paused" : ""}`}
            style={{ animationDuration: `${row.duration}s`, animationDelay: `${row.delay}s` }}
          >
            {[...row.items, ...row.items].map((item, i) => (
              <span key={i} className="quick-order-marquee-chip" style={{ color: item.color, fontSize: `${item.fontSizePx}px` }}>
                {item.text}
                <span className="quick-order-marquee-sep" aria-hidden="true">
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export type QuickOrderProductDocSection = "documents" | "drawings" | "description";

type QuickOrderModalProps = {
  product: ProductItem;
  initialQuantity?: number;
  onClosed: () => void;
  /** Открыть полную карточку товара (модалка/страница) на нужном блоке — например из каталога поверх быстрого заказа. */
  onOpenProductDocs?: (section: QuickOrderProductDocSection) => void;
};

export function QuickOrderModal({ product, initialQuantity = 1, onClosed, onOpenProductDocs }: QuickOrderModalProps) {
  const common = landingContent.common;
  const heroQuickOrder = landingContent.hero.quickOrderModal;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDeliveryDetailsOpen, setDeliveryDetailsOpen] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryHouse, setDeliveryHouse] = useState("");
  const [deliveryApartment, setDeliveryApartment] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "cdek" | "showroom">("courier");
  const [quantity, setQuantity] = useState(1);
  const [isConsentChecked, setConsentChecked] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [isQuickOrderClosing, setQuickOrderClosing] = useState(false);
  const [quickImageIndex, setQuickImageIndex] = useState(0);
  const [isQuickImageTransitioning, setQuickImageTransitioning] = useState(false);
  const CLOSE_ANIMATION_MS = 180;
  const SLIDE_MS = 3000;
  const TRANSITION_MS = 320;

  useEffect(() => {
    setSubmitted(false);
    setName("");
    setPhone("");
    setDeliveryDetailsOpen(false);
    setDeliveryCity("");
    setDeliveryStreet("");
    setDeliveryHouse("");
    setDeliveryApartment("");
    setDeliveryMethod("courier");
    setQuantity(Math.max(1, initialQuantity || 1));
    setConsentChecked(false);
    setQuickImageIndex(0);
    setQuickImageTransitioning(false);
    setQuickOrderClosing(false);
  }, [initialQuantity, product.sku]);

  const closeQuickOrder = () => {
    setQuickOrderClosing(true);
    window.setTimeout(() => {
      onClosed();
    }, CLOSE_ANIMATION_MS);
  };

  const submitQuickOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const typographicPhraseCycle = useMemo(() => {
    const productPhrases = buildProductPhrases(product);
    const merged = [...generalPhrases, ...productPhrases];
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const p of merged) {
      const t = p.trim();
      if (!t) continue;
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(t);
    }
    const base = unique.length ? unique : [...generalPhrases];
    return shuffleStrings(base, hashString(product.sku));
  }, [product]);

  const quickOrderMediaImages = useMemo(() => {
    const drawingUrls = new Set(product.drawings.flatMap((drawing) => drawing.urls));
    const source = product.cardImages?.length ? product.cardImages : product.images;
    const filtered = source.filter((url) => !drawingUrls.has(url));
    return filtered.length ? filtered : source;
  }, [product]);
  const quickOrderLeadImage = product.cardImages[product.mainImageIndex] ?? product.cardImages[0] ?? product.images[product.mainImageIndex] ?? product.images[0];
  const quickOrderPromoImage = quickOrderMediaImages[quickImageIndex] ?? quickOrderMediaImages[0] ?? quickOrderLeadImage;
  const totalPrice = useMemo(() => product.newPrice.amount * quantity, [product.newPrice.amount, quantity]);
  const totalSaving = useMemo(() => product.saving * quantity, [product.saving, quantity]);
  const totalOldPrice = useMemo(() => product.oldPrice.amount * quantity, [product.oldPrice.amount, quantity]);
  const { totalWeightKg, isWeightApproximate } = useMemo(() => {
    const single = parseWeightKg(product);
    if (single) {
      return { totalWeightKg: single * quantity, isWeightApproximate: false };
    }
    return { totalWeightKg: APPROX_GROSS_WEIGHT_KG * quantity, isWeightApproximate: true };
  }, [product, quantity]);

  const quickOrderKeyFeatures = useMemo(() => {
    const parseYears = (value: string) => {
      const match = value.match(/\d+/);
      return match ? Number(match[0]) : null;
    };

    const features = product.keyFeatures;
    const guaranteeIndex = features.findIndex((feature) => feature.name.toLowerCase().includes("гарант"));
    const guarantee = guaranteeIndex >= 0 ? features[guaranteeIndex] : undefined;
    const guaranteeYears = guarantee ? parseYears(guarantee.value) : null;

    if (!guarantee || !guaranteeYears || guaranteeYears >= 5) {
      return features.slice(0, 4);
    }

    const withoutGuarantee = features.filter((_, index) => index !== guaranteeIndex);
    const reserveFeature =
      product.features.find((feature) => {
        const key = feature.name.toLowerCase();
        return (
          !key.includes("гарант") &&
          !withoutGuarantee.some((existing) => existing.name === feature.name) &&
          (key.includes("картридж") ||
            key.includes("материал") ||
            key.includes("страна") ||
            key.includes("монтаж") ||
            key.includes("тип излива") ||
            key.includes("подвод"))
        );
      }) ?? product.features.find((feature) => !feature.name.toLowerCase().includes("гарант"));

    const primary = withoutGuarantee.slice(0, 3);
    if (reserveFeature) {
      return [...primary, reserveFeature];
    }
    return primary;
  }, [product]);

  useEffect(() => {
    if (isSubmitted) return;
    const images = quickOrderMediaImages;
    if (!images.length || images.length === 1) return;
    const timer = window.setInterval(() => {
      setQuickImageTransitioning(true);
      window.setTimeout(() => {
        setQuickImageIndex((prev) => (prev + 1) % images.length);
        setQuickImageTransitioning(false);
      }, TRANSITION_MS);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [TRANSITION_MS, SLIDE_MS, isSubmitted, quickOrderMediaImages]);

  return (
    <div
      className={`modal-backdrop quick-order-backdrop ${isQuickOrderClosing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={common.quickOrder}
      onClick={closeQuickOrder}
    >
      <div
        className="modal-card quick-order-modal quick-order-modal-with-bg"
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.96) 100%), url(${quickOrderBg.src})`,
        }}
      >
        <button type="button" className="modal-close" onClick={closeQuickOrder} aria-label={common.close}>
          ×
        </button>
        {!isSubmitted ? (
          <>
            <div className="quick-order-layout">
              <div className="quick-order-main">
                <h3>{heroQuickOrder.title}</h3>
                <div className="quick-order-product-summary">
                  <img src={quickOrderLeadImage} alt={product.name} className="quick-order-summary-image" />
                  <div className="quick-order-summary-copy">
                    <div className="quick-order-summary-meta">
                      <p className="quick-order-summary-sku">Арт.: {product.sku}</p>
                      <p className="quick-order-origin-badge">🇮🇹 Италия</p>
                    </div>
                    <p className="year-price-pill">Итальянские смесители по цене 2021 года</p>
                    <p className="quick-order-summary-name">{buildDisplayName(product.name, product.sku)}</p>
                    <div className="quick-order-summary-footer" aria-live="polite">
                      <div className="quick-order-summary-pricing">
                        <p className="quick-order-payline">
                          Стоимость товаров:{" "}
                          <strong>
                            {formatAmount(totalPrice)} {product.newPrice.currency}
                          </strong>
                        </p>
                        <div className="quick-order-summary-badges">
                          <p className="quick-order-discount-badge">-{product.discountPercent}%</p>
                          <p className="quick-order-saving-badge">Вы экономите {formatAmount(totalSaving)} ₽</p>
                        </div>
                        <p className="quick-order-oldline">
                          Было бы: {formatAmount(totalOldPrice)} {product.oldPrice.currency}
                        </p>
                        <p className="quick-order-weightline">Вес брутто: {formatWeight(totalWeightKg)} кг</p>
                      </div>
                      <div className="quick-order-summary-qty">
                        <label className="qty-label" htmlFor={`quick-order-qty-${product.sku}`}>Количество</label>
                        <div className="qty-stepper">
                          <button type="button" className="qty-stepper-btn" aria-label="Уменьшить количество" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                            <span aria-hidden="true">−</span>
                          </button>
                          <input
                            id={`quick-order-qty-${product.sku}`}
                            className="qty-input"
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                            aria-label="Количество товара"
                          />
                          <button type="button" className="qty-stepper-btn" aria-label="Увеличить количество" onClick={() => setQuantity((prev) => prev + 1)}>
                            <span aria-hidden="true">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {isWeightApproximate ? <p className="quick-order-weight-note">Примерный вес. Менеджер уточнит при оформлении и сообщит точные данные.</p> : null}
                  </div>
                </div>
                <p className="quick-order-subtitle">{heroQuickOrder.subtitle}</p>
                <a className="quick-order-phone" href={heroQuickOrder.phoneHref}>
                  {heroQuickOrder.phoneHint}
                </a>
                <form className="quick-order-form" onSubmit={submitQuickOrder}>
                  <label>
                    {heroQuickOrder.nameLabel}
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder={heroQuickOrder.namePlaceholder} />
                  </label>
                  <label>
                    {heroQuickOrder.phoneLabel}
                    <input
                      value={phone}
                      onChange={(event) => setPhone(formatRuPhone(event.target.value))}
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder={heroQuickOrder.phonePlaceholder}
                    />
                  </label>
                  <button
                    type="button"
                    className="quick-order-delivery-toggle"
                    onClick={() => setDeliveryDetailsOpen((prev) => !prev)}
                    aria-expanded={isDeliveryDetailsOpen}
                  >
                    {isDeliveryDetailsOpen ? "Свернуть поля доставки" : "Указать адрес доставки сразу"}
                  </button>
                  {isDeliveryDetailsOpen ? (
                    <div className="quick-order-delivery-fields">
                      <label>
                        Город
                        <input value={deliveryCity} onChange={(event) => setDeliveryCity(event.target.value)} placeholder="Например, Москва" />
                      </label>
                      <label>
                        Улица
                        <input value={deliveryStreet} onChange={(event) => setDeliveryStreet(event.target.value)} placeholder="Название улицы" />
                      </label>
                      <div className="quick-order-delivery-row">
                        <label>
                          Дом
                          <input value={deliveryHouse} onChange={(event) => setDeliveryHouse(event.target.value)} placeholder="Дом" />
                        </label>
                        <label>
                          Квартира
                          <input value={deliveryApartment} onChange={(event) => setDeliveryApartment(event.target.value)} placeholder="Кв." />
                        </label>
                      </div>
                      <fieldset className="quick-order-delivery-method" aria-label="Способ доставки">
                        <legend>Способ доставки</legend>
                        <label className={`quick-order-delivery-option ${deliveryMethod === "courier" ? "is-active" : ""}`}>
                          <input type="radio" name="delivery-method" value="courier" checked={deliveryMethod === "courier"} onChange={() => setDeliveryMethod("courier")} />
                          <span className="quick-order-delivery-option-content">
                            <Truck size={16} aria-hidden="true" />
                            <span>Доставить курьером</span>
                          </span>
                        </label>
                        <label className={`quick-order-delivery-option ${deliveryMethod === "cdek" ? "is-active" : ""}`}>
                          <input type="radio" name="delivery-method" value="cdek" checked={deliveryMethod === "cdek"} onChange={() => setDeliveryMethod("cdek")} />
                          <span className="quick-order-delivery-option-content">
                            <PackageCheck size={16} aria-hidden="true" />
                            <span>Забрать в ближайшем пункте CDEK</span>
                            <img src={cdek.src} alt="CDEK" className="quick-order-cdek-logo" />
                          </span>
                        </label>
                        <label className={`quick-order-delivery-option ${deliveryMethod === "showroom" ? "is-active" : ""}`}>
                          <input type="radio" name="delivery-method" value="showroom" checked={deliveryMethod === "showroom"} onChange={() => setDeliveryMethod("showroom")} />
                          <span className="quick-order-delivery-option-content">
                            <Store size={16} aria-hidden="true" />
                            <span>Самовывоз из шоурума</span>
                            <small className="quick-order-showroom-address">г. Москва, Ленинский пр-т, 67</small>
                          </span>
                        </label>
                      </fieldset>
                    </div>
                  ) : null}
                  <label className="consent-checkbox">
                    <input type="checkbox" checked={isConsentChecked} onChange={(event) => setConsentChecked(event.target.checked)} required />
                    <span>
                      {common.personalDataConsentLabel}{" "}
                      <a href="https://grifmaster.ru/site/pokupatelyam/o-personalnykh-dannykh/" target="_blank" rel="noreferrer">
                        {common.personalDataConsentPolicy}
                      </a>
                    </span>
                  </label>
                  <button className="btn btn-primary" type="submit">
                    {heroQuickOrder.submit}
                  </button>
                </form>
                <div className="quick-order-bottom">
                  <div className="quick-order-product-media">
                    <img
                      src={quickOrderPromoImage}
                      alt={product.name}
                      className={`quick-order-product-image ${isQuickImageTransitioning ? "is-transitioning" : ""}`}
                    />
                  </div>
                  <aside className="quick-order-insights">
                    <QuickOrderTypographicDrift
                      phrases={typographicPhraseCycle}
                      seed={hashString(product.sku)}
                      isPaused={isQuickOrderClosing}
                    />
                  </aside>
                </div>
                <section className="quick-order-meta">
                  <div className="quick-order-meta-card">
                    <p className="quick-order-meta-title">Ключевые характеристики</p>
                    <ul className="quick-order-meta-list">
                      {quickOrderKeyFeatures.map((feature) => (
                        <li key={`meta-${feature.name}-${feature.value}`}>
                          <strong>{feature.name}:</strong> {feature.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="quick-order-meta-card">
                    <p className="quick-order-meta-title">Документы по товару</p>
                    <div className="quick-order-docs" role="group" aria-label="Разделы карточки товара">
                      <button
                        type="button"
                        className={`quick-order-doc-pill${onOpenProductDocs ? "" : " quick-order-doc-pill--static"}`}
                        tabIndex={onOpenProductDocs ? undefined : -1}
                        aria-label="Открыть раздел документов в карточке товара"
                        onClick={() => onOpenProductDocs?.("documents")}
                      >
                        <FileText size={15} aria-hidden="true" />
                        Документы
                      </button>
                      <button
                        type="button"
                        className={`quick-order-doc-pill${onOpenProductDocs ? "" : " quick-order-doc-pill--static"}`}
                        tabIndex={onOpenProductDocs ? undefined : -1}
                        aria-label="Открыть описание и инструкции в карточке товара"
                        onClick={() => onOpenProductDocs?.("description")}
                      >
                        <BookOpen size={15} aria-hidden="true" />
                        Инструкции
                      </button>
                      <button
                        type="button"
                        className={`quick-order-doc-pill${onOpenProductDocs ? "" : " quick-order-doc-pill--static"}`}
                        tabIndex={onOpenProductDocs ? undefined : -1}
                        aria-label="Открыть чертежи и схемы в карточке товара"
                        onClick={() => onOpenProductDocs?.("drawings")}
                      >
                        <Ruler size={15} aria-hidden="true" />
                        Чертежи
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="quick-order-success">
            <h3>{heroQuickOrder.successTitle}</h3>
            <p>{heroQuickOrder.successText}</p>
            <button type="button" className="btn btn-primary" onClick={closeQuickOrder}>
              {heroQuickOrder.successClose}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
