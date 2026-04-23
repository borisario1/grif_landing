"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ShoppingCart } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import { catalogUiConfig, getProductPagePath } from "@/data/products";
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

export function ProductPageInteractive({ product, recommendedProducts }: ProductPageInteractiveProps) {
  const common = landingContent.common;
  const productView = landingContent.productView;
  const catalogText = landingContent.catalog;
  const AUTO_SLIDE_DURATION_MS = catalogUiConfig.modalAutoplayIntervalMs;
  const AUTO_SLIDE_TICK_MS = 120;
  const [activeImage, setActiveImage] = useState(product.mainImageIndex);
  const [renderedImage, setRenderedImage] = useState<string | null>(product.images[product.mainImageIndex] ?? product.images[0] ?? null);
  const [isImageSwitching, setImageSwitching] = useState(false);
  const [animateNextSwitch, setAnimateNextSwitch] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isGalleryHovered, setGalleryHovered] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    setActiveImage(product.mainImageIndex);
    setRenderedImage(product.images[product.mainImageIndex] ?? product.images[0] ?? null);
    setImageSwitching(false);
    setAnimateNextSwitch(false);
    setSlideProgress(0);
    setGalleryHovered(false);
    setShowAllFeatures(false);
    setQuantity(1);
    setLightboxImage(null);
  }, [product.mainImageIndex, product.sku, product.images]);

  useEffect(() => {
    if (!catalogUiConfig.modalAutoplayEnabled) {
      setSlideProgress(0);
      return;
    }
    if (catalogUiConfig.modalPauseOnHover && isGalleryHovered) return;
    if (product.images.length <= 1) {
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
            const normalizedCurrent = Math.max(0, Math.min(current, product.images.length - 1));
            return (normalizedCurrent + 1) % product.images.length;
          });
          return 0;
        }
        return next;
      });
    }, AUTO_SLIDE_TICK_MS);
    return () => clearInterval(timer);
  }, [AUTO_SLIDE_DURATION_MS, AUTO_SLIDE_TICK_MS, activeImage, isGalleryHovered, product.images.length]);

  useEffect(() => {
    const nextImage = product.images[activeImage] ?? product.images[0] ?? null;
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
  }, [activeImage, animateNextSwitch, product.images, renderedImage]);

  const safeMainImage = renderedImage ?? product.images[product.mainImageIndex] ?? product.images[0] ?? null;
  const descriptionBlocks = buildDescriptionBlocks(product.normalizedDescription || product.description);

  return (
    <>
      <article className="modal-card product-page-card">
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
              {product.images.map((url, index) => (
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
              <h1>{product.name}</h1>
              <p className="product-sku">
                {productView.sku}: <strong>{product.sku}</strong>
              </p>
              <div className="price-stack modal-price">
                <p className="product-price">
                  {Intl.NumberFormat("ru-RU").format(product.newPrice.amount)} {product.newPrice.currency}
                </p>
                <p className="product-price-old">
                  {Intl.NumberFormat("ru-RU").format(product.oldPrice.amount)} {product.oldPrice.currency}
                </p>
              </div>
              <div className="discount-row">
                <span className="discount-badge">-{product.discountPercent}%</span>
                <span className="saving-text">
                  <span className="saving-label">{catalogText.price.savingLabel}</span>
                  <strong className="saving-amount">{Intl.NumberFormat("ru-RU").format(product.saving)} ₽</strong>
                </span>
              </div>
            </div>

            <div className="purchase-panel">
              <label className="qty-label" htmlFor="page-qty">
                {productView.quantity}
              </label>
              <div className="qty-row">
                <input
                  id="page-qty"
                  className="qty-input"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
                <button className="btn btn-primary" type="button">
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

        <section className="modal-section">
          <div className="description-block full-width-description">
            <h4>{productView.description}</h4>
            <div className="modal-description">
              {descriptionBlocks.map((block, index) => (
                <p key={`${product.sku}-desc-${index}`} className={block.isHeading ? "modal-description-heading" : undefined}>
                  {block.text}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="modal-section">
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

        <section className="modal-section">
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

        <section className="modal-section">
          <h4>{productView.alsoChoose}</h4>
          <div className="suggestions-grid">
            {recommendedProducts.map((item) => (
              <article className="suggestion-card" key={item.sku}>
                <img src={item.images[0] ?? product.images[0]} alt={item.name} loading="lazy" />
                <strong>{item.name}</strong>
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
      </article>
      {lightboxImage && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр изображения" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Просмотр изображения" />
        </div>
      )}
    </>
  );
}
