"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { landingContent } from "@/data/landing-content";
import { catalogMeta, catalogUiConfig, getProductBySku, products } from "@/data/products";
import quickOrderBg from "@/images/professional-interior_2850587875.jpeg";
import { ProductItem } from "@/types/product";
import { CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";

const ALL = "all";

export function CatalogSection() {
  const c = landingContent.catalog;
  const common = landingContent.common;
  const heroQuickOrder = landingContent.hero.quickOrderModal;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedUsageType, setSelectedUsageType] = useState(ALL);
  const [selectedColor, setSelectedColor] = useState(ALL);
  const [displayMode, setDisplayMode] = useState(catalogUiConfig.defaultDisplayMode);
  const [openedProduct, setOpenedProduct] = useState<ProductItem | null>(null);
  const [quickOrderProduct, setQuickOrderProduct] = useState<ProductItem | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setSubmitted] = useState(false);

  useEffect(() => {
    const productSku = searchParams.get("product");
    if (!productSku) {
      if (openedProduct !== null) {
        setOpenedProduct(null);
      }
      return;
    }
    const matched = getProductBySku(productSku);
    if (matched && matched.sku !== openedProduct?.sku) {
      setOpenedProduct(matched);
    }
  }, [openedProduct, searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const categoryMatch = selectedCategory === ALL || item.category === selectedCategory;
      const usageTypeMatch = selectedUsageType === ALL || item.usageType === selectedUsageType;
      const colorMatch = selectedColor === ALL || item.color === selectedColor;
      return categoryMatch && usageTypeMatch && colorMatch;
    });
  }, [selectedCategory, selectedUsageType, selectedColor]);

  const colorHexMap = useMemo(
    () =>
      products.reduce<Record<string, string>>((acc, item) => {
        if (!acc[item.color]) acc[item.color] = item.colorHex;
        return acc;
      }, {}),
    [],
  );

  const openProductWithUrl = (product: ProductItem) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("product", product.sku);
    router.replace(`${pathname}?${params.toString()}#catalog`, { scroll: false });
  };

  const closeProductModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("product");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}#catalog` : `${pathname}#catalog`, { scroll: false });
  };

  const openQuickOrder = (product: ProductItem) => {
    setQuickOrderProduct(product);
    setSubmitted(false);
    setName("");
    setPhone("");
  };

  const submitQuickOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section" id="catalog">
      <div className="container">
        <h2>{c.title}</h2>
        <p className="section-lead">{c.lead}</p>

        <CatalogFilters
          categories={catalogMeta.categories}
          usageTypes={catalogMeta.usageTypes}
          colors={catalogMeta.colors}
          colorHexMap={colorHexMap}
          selectedCategory={selectedCategory}
          selectedUsageType={selectedUsageType}
          selectedColor={selectedColor}
          displayMode={displayMode}
          showDisplayModeToggle={catalogUiConfig.manualMainImageEnabled && catalogUiConfig.showDisplayModeToggleWhenManual}
          onCategoryChange={setSelectedCategory}
          onUsageTypeChange={setSelectedUsageType}
          onColorChange={setSelectedColor}
          onDisplayModeChange={setDisplayMode}
        />

        <div className="catalog-summary">
          {c.found} <strong>{filteredProducts.length}</strong> {c.outOf} {products.length}
        </div>

        <div className="catalog-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.sku}
              product={product}
              onOpen={openProductWithUrl}
              onQuickOrder={openQuickOrder}
              displayMode={displayMode}
            />
          ))}
        </div>
      </div>

      <ProductModal product={openedProduct} onClose={closeProductModal} onSelectProduct={openProductWithUrl} />
      {quickOrderProduct && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={common.quickOrder} onClick={() => setQuickOrderProduct(null)}>
          <div
            className="modal-card quick-order-modal quick-order-modal-with-bg"
            onClick={(event) => event.stopPropagation()}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.74) 100%), url(${quickOrderBg.src})`,
            }}
          >
            <button className="modal-close" onClick={() => setQuickOrderProduct(null)} aria-label={common.close}>
              ×
            </button>
            {!isSubmitted ? (
              <>
                <h3>{heroQuickOrder.title}</h3>
                <p className="quick-order-subtitle">
                  {quickOrderProduct.name}. {heroQuickOrder.subtitle}
                </p>
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
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder={heroQuickOrder.phonePlaceholder} />
                  </label>
                  <button className="btn btn-primary" type="submit">
                    {heroQuickOrder.submit}
                  </button>
                </form>
              </>
            ) : (
              <div className="quick-order-success">
                <h3>{heroQuickOrder.successTitle}</h3>
                <p>{heroQuickOrder.successText}</p>
                <button className="btn btn-primary" onClick={() => setQuickOrderProduct(null)}>
                  {heroQuickOrder.successClose}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
