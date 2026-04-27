"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlignLeft, ArrowUp, FileText, Ruler, ShoppingCart, X } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import { catalogUiConfig, getProductPagePath, getProductQuickOrderPath } from "@/data/products";
import { ProductItem } from "@/types/product";

type ProductPageInteractiveProps = {
  product: ProductItem;
  recommendedProducts: ProductItem[];
};

const buildDescriptionBlocks = (description: string) => {
  return description
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isHeading = line.length <= 48 && !/[.!?;:]$/.test(line);
      return { text: line, isHeading };
    });
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

export function ProductPageInteractive({ product, recommendedProducts }: ProductPageInteractiveProps) {
  const router = useRouter();
  const common = landingContent.common;
  const productView = landingContent.productView;
  const catalogText = landingContent.catalog;
  const AUTO_SLIDE_DURATION_MS = catalogUiConfig.modalAutoplayIntervalMs;
  const AUTO_SLIDE_TICK_MS = 120;
  const [activeImage, setActiveImage] = useState(product.mainImageIndex);
  const [renderedImage, setRenderedImage] = useState<string | null>(product.cardImages[product.mainImageIndex] ?? product.cardImages[0] ?? product.images[product.mainImageIndex] ?? product.images[0] ?? null);
  const [isImageSwitching, setImageSwitching] = useState(false);
  const [animateNextSwitch, setAnimateNextSwitch] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isGalleryHovered, setGalleryHovered] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const purchaseRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLElement | null>(null);
  const drawingsRef = useRef<HTMLElement | null>(null);
  const documentsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveImage(product.mainImageIndex);
    setRenderedImage(product.cardImages[product.mainImageIndex] ?? product.cardImages[0] ?? product.images[product.mainImageIndex] ?? product.images[0] ?? null);
    setImageSwitching(false);
    setAnimateNextSwitch(false);
    setSlideProgress(0);
    setGalleryHovered(false);
    setShowAllFeatures(false);
    setShowFullDescription(false);
    setQuantity(1);
    setLightboxImage(null);
  }, [product.mainImageIndex, product.sku, product.images]);

  useEffect(() => {
    if (!catalogUiConfig.modalAutoplayEnabled) {
      setSlideProgress(0);
      return;
    }
    if (catalogUiConfig.modalPauseOnHover && isGalleryHovered) return;
    const galleryImages = product.cardImages.length ? product.cardImages : product.images;
    if (galleryImages.length <= 1) {
      setSlideProgress(100);
      return;
    }
    setSlideProgress(0);
    const progressStep = (AUTO_SLIDE_TICK_MS / AUTO_SLIDE_DURATION_MS) * 100;
    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        const next = prev + progressStep;
        if (next >= 100) {
          setAnimateNextSwitch(true);
          setActiveImage((current) => {
            const normalizedCurrent = Math.max(0, Math.min(current, galleryImages.length - 1));
            return (normalizedCurrent + 1) % galleryImages.length;
          });
          return 0;
        }
        return next;
      });
    }, AUTO_SLIDE_TICK_MS);
    return () => clearInterval(timer);
  }, [AUTO_SLIDE_DURATION_MS, AUTO_SLIDE_TICK_MS, activeImage, isGalleryHovered, product.cardImages, product.images]);

  useEffect(() => {
    const galleryImages = product.cardImages.length ? product.cardImages : product.images;
    const nextImage = galleryImages[activeImage] ?? galleryImages[0] ?? null;
    if (!nextImage || nextImage === renderedImage) return;
    if (!animateNextSwitch) {
      setRenderedImage(nextImage);
      return;
    }
    setImageSwitching(true);
    const switchTimer = setTimeout(() => {
      setRenderedImage(nextImage);
      requestAnimationFrame(() => setImageSwitching(false));
    }, 120);
    return () => clearTimeout(switchTimer);
  }, [activeImage, animateNextSwitch, product.cardImages, product.images, renderedImage]);

  const galleryImages = product.cardImages.length ? product.cardImages : product.images;
  const thumbImages = product.thumbImages.length ? product.thumbImages : galleryImages;
  const safeMainImage = renderedImage ?? galleryImages[product.mainImageIndex] ?? galleryImages[0] ?? product.images[0] ?? null;
  const totalOldAmount = product.oldPrice.amount * quantity;
  const totalNewAmount = product.newPrice.amount * quantity;
  const totalSavingAmount = product.saving * quantity;
  const descriptionBlocks = buildDescriptionBlocks(product.normalizedDescription || product.description);
  const hasLongDescription = descriptionBlocks.length > 3;
  const visibleDescriptionBlocks = showFullDescription ? descriptionBlocks : descriptionBlocks.slice(0, 3);
  const scrollToSection = (target: { current: HTMLElement | null }) => {
    target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <article className="modal-card product-page-card">
        <div className="modal-floating-nav" aria-label="Навигация по разделам">
          <button type="button" className="modal-side-nav-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Вверх карточки товара">
            <ArrowUp size={16} aria-hidden="true" />
          </button>
          <button type="button" className="modal-side-nav-btn" onClick={() => scrollToSection(descriptionRef)} aria-label="К описанию">
            <AlignLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" className="modal-side-nav-btn" onClick={() => scrollToSection(drawingsRef)} aria-label="К схемам и чертежам">
            <Ruler size={16} aria-hidden="true" />
          </button>
          <button type="button" className="modal-side-nav-btn" onClick={() => scrollToSection(documentsRef)} aria-label="К документам">
            <FileText size={16} aria-hidden="true" />
          </button>
          <Link href="/#catalog" className="modal-side-nav-btn is-close" aria-label="Закрыть карточку и вернуться в каталог">
            <X size={16} aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          className="modal-order-cta"
          onClick={() => purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <ShoppingCart size={16} aria-hidden="true" />
          Заказать
        </button>
        <div className="modal-top">
          <section
            className="gallery-column"
            onMouseEnter={() => catalogUiConfig.modalPauseOnHover && setGalleryHovered(true)}
            onMouseLeave={() => catalogUiConfig.modalPauseOnHover && setGalleryHovered(false)}
          >
            <button className="main-product-image zoomable-image" type="button" onClick={() => safeMainImage && setLightboxImage(safeMainImage)}>
              {safeMainImage ? (
                <img src={safeMainImage} alt={product.name} className={`product-image-fade ${isImageSwitching ? "switching" : ""}`} />
              ) : null}
            </button>
            {catalogUiConfig.modalAutoplayEnabled && (
              <div className="image-auto-slider" role="presentation" aria-hidden="true">
                <div className="image-auto-slider-fill" style={{ width: `${slideProgress}%` }} />
              </div>
            )}
            <div className="thumbnail-row">
              {thumbImages.map((url, index) => (
                <button
                  key={url}
                  className={`thumbnail-btn ${activeImage === index ? "active" : ""}`}
                  onClick={() => {
                    setAnimateNextSwitch(true);
                    setActiveImage(index);
                    setSlideProgress(0);
                  }}
                >
                  <img src={url} alt={`${product.name} изображение ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>

          <section className="details-column">
            <div className="modal-head">
              <h1>{buildDisplayName(product.name, product.sku)}</h1>
              <p className="product-sku">
                {productView.sku}: <strong>{product.sku}</strong>
              </p>
              <p className="year-price-pill">Итальянские смесители по цене 2021 года</p>
              <div className="price-stack modal-price">
                <p className="product-price-old">
                  {Intl.NumberFormat("ru-RU").format(totalOldAmount)} {product.oldPrice.currency}
                </p>
                <p className="product-price">
                  {Intl.NumberFormat("ru-RU").format(totalNewAmount)} {product.newPrice.currency}
                </p>
              </div>
              <div className="discount-row">
                <span className="saving-text">
                  <span className="saving-label">{catalogText.price.savingLabel}</span>
                  <strong className="saving-amount">{Intl.NumberFormat("ru-RU").format(totalSavingAmount)} ₽</strong>
                </span>
                <span className="discount-badge">-{product.discountPercent}%</span>
              </div>
            </div>

            <div className="purchase-panel" ref={purchaseRef}>
              <label className="qty-label" htmlFor="page-qty">
                {productView.quantity}
              </label>
              <div className="qty-row">
                <div className="qty-stepper">
                  <button type="button" className="qty-stepper-btn" aria-label="Уменьшить количество" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                    <span aria-hidden="true">−</span>
                  </button>
                  <input
                    id="page-qty"
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
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    const base = getProductQuickOrderPath(product.sku);
                    const url = quantity > 1 ? `${base}&qty=${quantity}` : base;
                    router.push(url, { scroll: false });
                  }}
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  {common.buy}
                </button>
              </div>
            </div>

            <h4>{productView.keyFeatures}</h4>
            <div className="features-list">
              {product.keyFeatures.map((feature) => (
                <div key={`${feature.name}-${feature.value}`} className="feature-row">
                  <span>{feature.name}</span>
                  <strong>{feature.value}</strong>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary modal-toggle" onClick={() => setShowAllFeatures((prev) => !prev)}>
              {showAllFeatures ? common.hideFullInfo : common.showFullInfo}
            </button>
            {showAllFeatures && (
              <div className="features-list all-features">
                {product.features.map((feature) => (
                  <div key={`full-${feature.name}-${feature.value}`} className="feature-row">
                    <span>{feature.name}</span>
                    <strong>{feature.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section id="product-description" className="modal-section modal-anchor-section" ref={descriptionRef}>
          <div className="description-block full-width-description">
            <h4>{productView.description}</h4>
            <div className="modal-description">
              {visibleDescriptionBlocks.map((block, index) => (
                <p key={`${product.sku}-desc-${index}`} className={block.isHeading ? "modal-description-heading" : undefined}>
                  {block.text}
                </p>
              ))}
            </div>
            {hasLongDescription && (
              <button className="btn btn-secondary modal-toggle" onClick={() => setShowFullDescription((prev) => !prev)}>
                {showFullDescription ? "Свернуть" : "Читать полное описание..."}
              </button>
            )}
          </div>
        </section>

        <section className="modal-section">
          <h4>{productView.alsoChoose}</h4>
          <div className="suggestions-grid">
            {recommendedProducts.map((item) => (
              <article className="suggestion-card" key={item.sku}>
                <img src={item.cardImages[0] ?? item.images[0] ?? product.cardImages[0] ?? product.images[0]} alt={item.name} loading="lazy" />
                <strong>{buildDisplayName(item.name, item.sku)}</strong>
                <p>
                  {Intl.NumberFormat("ru-RU").format(item.newPrice.amount)} {item.newPrice.currency}
                </p>
                <Link
                  className="btn btn-primary suggestion-btn"
                  href={getProductPagePath(item.sku)}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  {productView.open}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="product-drawings" className="modal-section modal-anchor-section" ref={drawingsRef}>
          <h4>{productView.drawings}</h4>
          <div className="modal-gallery drawings-unified">
            {product.drawings.flatMap((drawing) =>
              drawing.urls.map((url, index) => (
                <button
                  type="button"
                  className="zoomable-image drawing-image-btn"
                  key={`${drawing.type}-${url}-${index}`}
                  onClick={() => setLightboxImage(url)}
                >
                  <img src={url} alt={`${product.name} ${drawing.type}`} loading="lazy" />
                </button>
              )),
            )}
          </div>
        </section>

        <section id="product-documents" className="modal-section modal-anchor-section" ref={documentsRef}>
          <h4>{productView.documents}</h4>
          <div className="document-cards">
            {product.documents.map((doc) => (
              <a className="document-card" key={doc.url} href={doc.url} target="_blank" rel="noreferrer">
                <FileText size={18} aria-hidden="true" />
                <strong>{doc.title}</strong>
                <span>{productView.openDocument}</span>
              </a>
            ))}
          </div>
        </section>

      </article>
      {lightboxImage && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр изображения" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Просмотр изображения" />
        </div>
      )}
    </>
  );
}
