"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlignLeft, Eye, FileText, Ruler, ShoppingBag } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import { catalogUiConfig, CatalogDisplayMode, getProductPagePath } from "@/data/products";
import { ProductItem } from "@/types/product";

type ProductCardProps = {
  product: ProductItem;
  onOpen: (product: ProductItem, section?: "features" | "drawings" | "documents" | "description") => void;
  onQuickOrder: (product: ProductItem, quantity: number) => void;
  displayMode: CatalogDisplayMode;
  prioritizeMainImage?: boolean;
};

const formatAmount = (amount: number) =>
  Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(amount);

const buildDisplayName = (name: string, sku: string) => {
  const escapedSku = sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const trimmed = name.trim();
  const exactRemoved = trimmed.replace(new RegExp(`^\\s*${escapedSku}(?:\\s+|\\s*[-:|/]\\s*)?`, "i"), "").trim();
  if (exactRemoved && exactRemoved !== trimmed) return exactRemoved;
  const tokenMatch = trimmed.match(/^([A-Za-z0-9/-]{5,})\s+(.+)$/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const rest = tokenMatch[2]?.trim();
    if (rest && /\d/.test(token) && /[A-Za-z]/.test(token)) {
      return rest;
    }
  }
  return trimmed;
};

export function ProductCard({ product, onOpen, onQuickOrder, displayMode, prioritizeMainImage = false }: ProductCardProps) {
  const catalogText = landingContent.catalog;
  const defaultImageIndex = displayMode === "more_info" ? 0 : product.mainImageIndex;
  const [activeImage, setActiveImage] = useState(defaultImageIndex);
  const gallery = product.cardImages.slice(0, 4);
  const galleryThumbs = product.thumbImages.slice(0, 4);
  const [renderedImage, setRenderedImage] = useState(product.cardImages[defaultImageIndex] ?? product.images[defaultImageIndex] ?? product.images[0]);
  const [isImageSwitching, setImageSwitching] = useState(false);
  const [loadedMainImages, setLoadedMainImages] = useState<Record<string, boolean>>({});
  const [loadedThumbs, setLoadedThumbs] = useState<Record<number, boolean>>({});
  const [isGalleryExpanded, setGalleryExpanded] = useState(false);
  const [isBadgeAreaHovered, setBadgeAreaHovered] = useState(false);
  const [badgeTone, setBadgeTone] = useState<"light" | "dark">("dark");
  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const displayName = buildDisplayName(product.name, product.sku);
  const cardBenefits = (() => {
    const marketingLine = { name: "Срок службы", value: "25 лет" };
    const countryLine = { name: "Страна", value: "🇮🇹 Италия" };
    const bodyMaterial = product.keyFeatures.find((item) => item.name === "Материал корпуса");
    const fallback = product.keyFeatures.filter(
      (item) =>
        item.name !== "Гарантия" &&
        item.name !== "Срок службы" &&
        item.name !== "Материал корпуса" &&
        item.name !== "Страна происхождения" &&
        item.name !== "Страна",
    );

    if (bodyMaterial) {
      return [marketingLine, countryLine, bodyMaterial];
    }

    return [marketingLine, countryLine, ...fallback].slice(0, 3);
  })();

  useEffect(() => {
    setActiveImage(defaultImageIndex);
  }, [defaultImageIndex, product.sku]);

  useEffect(() => {
    setGalleryExpanded(false);
    setLoadedThumbs({});
  }, [displayMode, product.sku]);
  const isImageLoaded = Boolean(loadedMainImages[renderedImage]);

  useEffect(() => {
    const imageElement = mainImageRef.current;
    if (!imageElement) return;
    if (imageElement.complete) {
      setLoadedMainImages((prev) => ({ ...prev, [renderedImage]: true }));
    }
  }, [renderedImage]);

  useEffect(() => {
    const nextImage = gallery[activeImage] ?? product.images[0];
    const fromCardList = product.cardImages[activeImage];
    const resolvedImage = fromCardList ?? nextImage ?? product.images[activeImage] ?? product.images[0];
    if (!resolvedImage || resolvedImage === renderedImage) return;
    setImageSwitching(true);
    const switchTimer = setTimeout(() => {
      setRenderedImage(resolvedImage);
      requestAnimationFrame(() => setImageSwitching(false));
    }, 120);
    return () => clearTimeout(switchTimer);
  }, [activeImage, gallery, product.cardImages, product.images, renderedImage]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = renderedImage;
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        const size = 18;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let total = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          total += luminance;
          count += 1;
        }
        const avg = count ? total / count : 0.5;
        setBadgeTone(avg < 0.52 ? "light" : "dark");
      } catch {
        setBadgeTone("dark");
      }
    };
    img.onerror = () => setBadgeTone("dark");
    return () => {
      cancelled = true;
    };
  }, [renderedImage]);

  const applyHoverImageSwap = () => {
    if (!catalogUiConfig.cardHoverMainImageSwapEnabled || isBadgeAreaHovered) return;
    if (displayMode === "more_goods") {
      setActiveImage(0);
      return;
    }
    if (displayMode === "more_info") {
      setActiveImage(product.mainImageIndex);
    }
  };

  const resetHoverImageSwap = () => {
    if (!catalogUiConfig.cardHoverMainImageSwapEnabled) return;
    if (displayMode === "more_goods") {
      setActiveImage(product.mainImageIndex);
      return;
    }
    if (displayMode === "more_info") {
      setActiveImage(0);
    }
  };

  const openSection = (section: "features" | "drawings" | "documents" | "description", event?: { stopPropagation: () => void; preventDefault?: () => void }) => {
    event?.preventDefault?.();
    event?.stopPropagation();
    onOpen(product, section);
  };

  return (
    <article
      className="product-card"
      onClick={() => onOpen(product)}
      onTouchStart={() => setGalleryExpanded(true)}
    >
      <div
        className="product-image-wrap product-image-trigger"
        role="button"
        tabIndex={0}
        aria-label={`Открыть ${product.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(product);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onOpen(product);
          }
        }}
        onMouseEnter={(event) => {
          setGalleryExpanded(true);
          const rect = event.currentTarget.getBoundingClientRect();
          const inBadgeZone = event.clientX <= rect.left + 150 && event.clientY <= rect.top + 115;
          if (!inBadgeZone) {
            applyHoverImageSwap();
          }
        }}
        onMouseMove={() => {
          applyHoverImageSwap();
        }}
        onMouseLeave={() => {
          resetHoverImageSwap();
        }}
      >
        {!isImageLoaded && (
          <span className="product-image-loader" aria-hidden="true">
            <span className="product-image-loader-spinner" />
          </span>
        )}
        <img
          ref={mainImageRef}
          src={renderedImage}
          alt={displayName}
          className={`product-image product-image-fade ${isImageSwitching ? "switching" : ""} ${isImageLoaded ? "image-loaded" : "image-loading"}`}
          loading={prioritizeMainImage ? "eager" : "lazy"}
          fetchPriority={prioritizeMainImage ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoadedMainImages((prev) => ({ ...prev, [renderedImage]: true }))}
          onError={() => setLoadedMainImages((prev) => ({ ...prev, [renderedImage]: true }))}
        />
        <div
          className={`product-image-badges tone-${badgeTone}`}
          onClick={(event) => event.stopPropagation()}
          onMouseEnter={() => setBadgeAreaHovered(true)}
          onMouseLeave={() => setBadgeAreaHovered(false)}
        >
          <span
            role="button"
            tabIndex={0}
            className="product-image-badge"
            onClick={(event) => openSection("features", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("features", event);
              }
            }}
          >
            <AlignLeft size={13} aria-hidden="true" />
            <span className="product-image-badge-label">Характеристики</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            className="product-image-badge"
            onClick={(event) => openSection("drawings", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("drawings", event);
              }
            }}
          >
            <Ruler size={13} aria-hidden="true" />
            <span className="product-image-badge-label">Чертежи, схемы</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            className="product-image-badge"
            onClick={(event) => openSection("documents", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("documents", event);
              }
            }}
          >
            <FileText size={13} aria-hidden="true" />
            <span className="product-image-badge-label">Сертификаты</span>
          </span>
        </div>
        <span
          className="product-quick-view-overlay"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(product);
          }}
        >
          Быстрый просмотр
        </span>
      </div>
      <div className="product-thumbs">
        {gallery.map((image, index) => {
          const shouldLoadThumb = isGalleryExpanded || index === 0 || index === activeImage;
          const isThumbLoaded = Boolean(loadedThumbs[index]);
          const thumbImage = galleryThumbs[index] ?? image;
          return (
          <button
            key={`${product.sku}-${image}`}
            className={`product-thumb ${index === activeImage ? "active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setGalleryExpanded(true);
              setActiveImage(index);
            }}
            aria-label={`Показать фото ${index + 1}`}
          >
            {shouldLoadThumb && !isThumbLoaded && (
              <span className="product-thumb-loader" aria-hidden="true">
                <span className="product-thumb-loader-spinner" />
              </span>
            )}
            {shouldLoadThumb && (
              <img
                src={thumbImage}
                alt={`${product.name} превью ${index + 1}`}
                loading="lazy"
                decoding="async"
                className={isThumbLoaded ? "thumb-loaded" : "thumb-loading"}
                onLoad={() => setLoadedThumbs((prev) => ({ ...prev, [index]: true }))}
                onError={() => setLoadedThumbs((prev) => ({ ...prev, [index]: true }))}
              />
            )}
          </button>
          );
        })}
      </div>
      <div className="product-body">
        <div className="product-title-block">
          <h3 className="product-title-trigger">
            <Link href={getProductPagePath(product.sku)} onClick={(event) => event.stopPropagation()}>
              {displayName}
            </Link>
          </h3>
          <p className="product-sku">Арт.: {product.sku}</p>
        </div>
        <div className="price-stack">
          <p className="product-price-old">
            {formatAmount(product.oldPrice.amount)} {product.oldPrice.currency}
          </p>
          <p className="product-price">
            {formatAmount(product.newPrice.amount)} {product.newPrice.currency}
          </p>
        </div>
        <div className="discount-row">
          <span className="saving-text">
            <span className="saving-label">{catalogText.price.savingLabel}</span>
            <strong className="saving-amount">{formatAmount(product.saving)} ₽</strong>
          </span>
          <span className="discount-badge">-{product.discountPercent}%</span>
        </div>
        <ul className="product-benefits compact">
          {cardBenefits.map((benefit) => (
            <li key={`${benefit.name}-${benefit.value}`}>
              {benefit.name}:{" "}
              {benefit.name === "Страна" ? <span className="country-flag-value">{benefit.value}</span> : benefit.value}
            </li>
          ))}
        </ul>
        <div className="product-mobile-shortcuts">
          <span
            role="button"
            tabIndex={0}
            className="product-mobile-shortcut"
            onClick={(event) => openSection("features", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("features", event);
              }
            }}
          >
            <AlignLeft size={13} aria-hidden="true" />
            <span>Характеристики</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            className="product-mobile-shortcut"
            onClick={(event) => openSection("drawings", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("drawings", event);
              }
            }}
          >
            <Ruler size={13} aria-hidden="true" />
            <span className="label-full">Чертежи, схемы</span>
            <span className="label-short">Чертежи</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            className="product-mobile-shortcut"
            onClick={(event) => openSection("documents", event)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openSection("documents", event);
              }
            }}
          >
            <FileText size={13} aria-hidden="true" />
            <span>Сертификаты</span>
          </span>
        </div>
        <button
          className="btn btn-secondary btn-with-icon product-details-btn"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(product);
          }}
        >
          <Eye size={16} aria-hidden="true" />
          Подробнее
        </button>
        <button
          className="btn btn-primary btn-with-icon product-quick-btn"
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onQuickOrder(product, 1);
          }}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Заказать
        </button>
      </div>
    </article>
  );
}
