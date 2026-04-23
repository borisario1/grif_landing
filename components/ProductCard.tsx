"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, PhoneCall } from "lucide-react";
import { landingContent } from "@/data/landing-content";
import { catalogUiConfig, CatalogDisplayMode, getProductPagePath } from "@/data/products";
import { ProductItem } from "@/types/product";

type ProductCardProps = {
  product: ProductItem;
  onOpen: (product: ProductItem) => void;
  onQuickOrder: (product: ProductItem) => void;
  displayMode: CatalogDisplayMode;
};

const formatAmount = (amount: number) =>
  Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(amount);

export function ProductCard({ product, onOpen, onQuickOrder, displayMode }: ProductCardProps) {
  const common = landingContent.common;
  const catalogText = landingContent.catalog;
  const defaultImageIndex = displayMode === "more_info" ? 0 : product.mainImageIndex;
  const [activeImage, setActiveImage] = useState(defaultImageIndex);
  const gallery = product.images.slice(0, 4);
  const [renderedImage, setRenderedImage] = useState(product.images[defaultImageIndex] ?? product.images[0]);
  const [isImageSwitching, setImageSwitching] = useState(false);
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
    const nextImage = gallery[activeImage] ?? product.images[0];
    const fromFullList = product.images[activeImage];
    const resolvedImage = fromFullList ?? nextImage ?? product.images[0];
    if (!resolvedImage || resolvedImage === renderedImage) return;
    setImageSwitching(true);
    const switchTimer = setTimeout(() => {
      setRenderedImage(resolvedImage);
      requestAnimationFrame(() => setImageSwitching(false));
    }, 120);
    return () => clearTimeout(switchTimer);
  }, [activeImage, gallery, product.images, renderedImage]);

  return (
    <article
      className="product-card"
      onClick={() => onOpen(product)}
      onMouseEnter={() => {
        if (!catalogUiConfig.cardHoverMainImageSwapEnabled) return;
        if (displayMode === "more_goods") {
          setActiveImage(0);
          return;
        }
        if (displayMode === "more_info") {
          setActiveImage(product.mainImageIndex);
        }
      }}
      onMouseLeave={() => {
        if (!catalogUiConfig.cardHoverMainImageSwapEnabled) return;
        if (displayMode === "more_goods") {
          setActiveImage(product.mainImageIndex);
          return;
        }
        if (displayMode === "more_info") {
          setActiveImage(0);
        }
      }}
    >
      <button className="product-image-wrap product-image-trigger" type="button" aria-label={`Открыть ${product.name}`}>
        <img
          src={renderedImage}
          alt={product.name}
          className={`product-image product-image-fade ${isImageSwitching ? "switching" : ""}`}
          loading="lazy"
        />
        <span
          className="product-quick-view-overlay"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(product);
          }}
        >
          Быстрый просмотр
        </span>
      </button>
      <div className="product-thumbs">
        {gallery.map((image, index) => (
          <button
            key={`${product.sku}-${image}`}
            className={`product-thumb ${index === activeImage ? "active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setActiveImage(index);
            }}
            aria-label={`Показать фото ${index + 1}`}
          >
            <img src={image} alt={`${product.name} превью ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
      <div className="product-body">
        <div className="product-title-block">
          <h3 className="product-title-trigger">
            <Link href={getProductPagePath(product.sku)} onClick={(event) => event.stopPropagation()}>
              {product.name}
            </Link>
          </h3>
          <p className="product-sku">{product.sku}</p>
        </div>
        <div className="price-stack">
          <p className="product-price">
            {formatAmount(product.newPrice.amount)} {product.newPrice.currency}
          </p>
          <p className="product-price-old">
            {formatAmount(product.oldPrice.amount)} {product.oldPrice.currency}
          </p>
        </div>
        <div className="discount-row">
          <span className="discount-badge">-{product.discountPercent}%</span>
          <span className="saving-text">
            <span className="saving-label">{catalogText.price.savingLabel}</span>
            <strong className="saving-amount">{formatAmount(product.saving)} ₽</strong>
          </span>
        </div>
        <ul className="product-benefits compact">
          {cardBenefits.map((benefit) => (
            <li key={`${benefit.name}-${benefit.value}`}>
              {benefit.name}:{" "}
              {benefit.name === "Страна" ? <span className="country-flag-value">{benefit.value}</span> : benefit.value}
            </li>
          ))}
        </ul>
        <Link
          className="btn btn-primary btn-with-icon"
          href={getProductPagePath(product.sku)}
          onClick={(event) => event.stopPropagation()}
        >
          <Info size={16} aria-hidden="true" />
          {common.details}
        </Link>
        <button
          className="btn btn-secondary btn-with-icon product-quick-btn"
          onClick={(event) => {
            event.stopPropagation();
            onQuickOrder(product);
          }}
        >
          <PhoneCall size={16} aria-hidden="true" />
          {common.quickOrder}
        </button>
      </div>
    </article>
  );
}
