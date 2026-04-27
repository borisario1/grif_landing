"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BookOpen, FileText, PackageCheck, Ruler, Store, Truck } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import quickOrderBg from "@/images/professional-interior_2850587875.jpeg";
import cdek from "@/images/cdek.jpg";
import { ProductItem } from "@/types/product";

const QUICK_ORDER_PHRASES = [
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

type FloatingPhrase = {
  id: number;
  slot: number;
  text: string;
  kind: "country" | "regular";
  tone: "deep" | "blue" | "sky" | "amber";
  fontSizeRem: number;
  entering: boolean;
  softFading: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeMs: number;
  enterMs: number;
  exitMs: number;
  exiting: boolean;
};

type PhraseOption = {
  text: string;
  kind: "country" | "regular";
};

const CLOUD_SLOTS = [
  { x: 2, y: 4 },
  { x: 58, y: 4 },
  { x: 30, y: 36 },
  { x: 2, y: 68 },
  { x: 58, y: 68 },
];

const CLOUD_SLOT_DRIFT = [
  { x: -10, y: -6 },
  { x: 10, y: -6 },
  { x: 0, y: 10 },
  { x: -10, y: 6 },
  { x: 10, y: 6 },
];

const resolvePhraseFontSize = (text: string) => {
  const len = text.trim().length;
  if (len <= 26) return 0.98;
  if (len <= 44) return 0.93;
  if (len <= 62) return 0.88;
  return 0.83;
};

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
  const [floatingPhrases, setFloatingPhrases] = useState<FloatingPhrase[]>([]);
  const CLOSE_ANIMATION_MS = 180;
  const SLIDE_MS = 3000;
  const TRANSITION_MS = 320;
  const phraseIdRef = useRef(0);
  const phraseCursorRef = useRef(0);
  const phraseTimersRef = useRef<number[]>([]);
  const lastToneRef = useRef<FloatingPhrase["tone"]>("deep");

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
    setFloatingPhrases([]);
    setQuickOrderClosing(false);
    phraseCursorRef.current = 0;
    lastToneRef.current = "deep";
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

  const quickOrderPhrases = useMemo<PhraseOption[]>(
    () => QUICK_ORDER_PHRASES.map((text) => ({ text, kind: "regular" as const })),
    [],
  );

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

  useEffect(() => {
    const pickTone = (): FloatingPhrase["tone"] => {
      const tones: FloatingPhrase["tone"][] = ["deep", "blue", "sky", "amber"];
      const candidates = tones.filter((tone) => tone !== lastToneRef.current);
      const next = candidates[Math.floor(Math.random() * candidates.length)] ?? tones[0];
      lastToneRef.current = next;
      return next;
    };

    const clearPhraseTimers = () => {
      phraseTimersRef.current.forEach((id) => window.clearTimeout(id));
      phraseTimersRef.current = [];
    };
    const pickPhrase = (existing: FloatingPhrase[]) => {
      const hasCountry = existing.some((phrase) => phrase.kind === "country" && !phrase.exiting);
      const pool = hasCountry ? quickOrderPhrases.filter((p) => p.kind !== "country") : quickOrderPhrases;
      if (!pool.length) return null;
      const phrase = pool[phraseCursorRef.current % pool.length];
      phraseCursorRef.current += 1;
      return phrase;
    };
    const addPhraseToSlot = (slot: number) => {
      setFloatingPhrases((prev) => {
        if (prev.some((p) => p.slot === slot)) return prev;
        const selected = pickPhrase(prev);
        if (!selected) return prev;
        const id = ++phraseIdRef.current;
        const drift = CLOUD_SLOT_DRIFT[slot] ?? CLOUD_SLOT_DRIFT[0];
        const pos = CLOUD_SLOTS[slot] ?? CLOUD_SLOTS[0];
        return [
          ...prev,
          {
            id,
            slot,
            text: selected.text,
            kind: selected.kind,
            tone: pickTone(),
            fontSizeRem: resolvePhraseFontSize(selected.text),
            entering: true,
            softFading: false,
            x: pos.x,
            y: pos.y,
            vx: drift.x,
            vy: drift.y,
            lifeMs: 0,
            enterMs: 1800,
            exitMs: 1800,
            exiting: false,
          },
        ];
      });
      phraseTimersRef.current.push(
        window.setTimeout(() => {
          setFloatingPhrases((prev) => prev.map((p) => (p.slot === slot ? { ...p, entering: false } : p)));
        }, 1800),
      );
    };
    const replaceSlot = (slot: number) => {
      setFloatingPhrases((prev) => {
        if (prev.length < 5) return prev;
        return prev.map((p) => (p.slot === slot ? { ...p, exiting: true } : p));
      });
      phraseTimersRef.current.push(
        window.setTimeout(() => {
          setFloatingPhrases((prev) => prev.filter((p) => p.slot !== slot));
          addPhraseToSlot(slot);
        }, 1800),
      );
    };
    const scheduleSlotReplacement = (slot: number) => {
      // Интервал смены фразы для каждого слота (сейчас 30-60 сек).
      const delay = 30000 + Math.floor(Math.random() * 30000);
      phraseTimersRef.current.push(
        window.setTimeout(() => {
          replaceSlot(slot);
          scheduleSlotReplacement(slot);
        }, delay),
      );
    };

    clearPhraseTimers();
    setFloatingPhrases([]);
    if (isSubmitted || !quickOrderPhrases.length) return;

    CLOUD_SLOTS.forEach((_, idx) => {
      phraseTimersRef.current.push(window.setTimeout(() => addPhraseToSlot(idx), idx * 320));
    });

    CLOUD_SLOTS.forEach((_, slotIdx) => {
      scheduleSlotReplacement(slotIdx);
    });

    return () => clearPhraseTimers();
  }, [quickOrderPhrases, isSubmitted]);

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
                    <div className="quick-order-phrase-cloud">
                      {floatingPhrases.map((phrase) => (
                        <p
                          key={phrase.id}
                          className={`quick-order-phrase slot-${phrase.slot} tone-${phrase.tone} ${phrase.entering ? "is-entering" : ""} ${phrase.softFading ? "is-soft-fading" : ""} ${phrase.exiting ? "is-transitioning" : ""}`}
                          style={{
                            left: `${phrase.x}%`,
                            top: `${phrase.y}%`,
                            fontSize: `${phrase.fontSizeRem}rem`,
                            animationDuration: `${phrase.enterMs}ms`,
                            "--drift-x": `${phrase.vx}px`,
                            "--drift-y": `${phrase.vy}px`,
                            // Скорость плавного дрейфа текста (чем больше, тем медленнее).
                            "--drift-duration": `${28250000 + (phrase.id % 4) * 150000}ms`,
                          } as CSSProperties}
                        >
                          {phrase.text}
                        </p>
                      ))}
                    </div>
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
