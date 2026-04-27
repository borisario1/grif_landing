"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { landingContent } from "@/data/landing-content";
import { catalogUiConfig, getProductBySku, getProductPagePath, getProductQuickOrderPath, products } from "@/data/products";
import { ProductItem } from "@/types/product";
import { CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { QuickOrderModal } from "@/components/QuickOrderModal";

const ALL = "all";

export function CatalogSection() {
  const c = landingContent.catalog;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedUsageType, setSelectedUsageType] = useState(ALL);
  const [selectedColor, setSelectedColor] = useState(ALL);
  const [displayMode, setDisplayMode] = useState(catalogUiConfig.defaultDisplayMode);
  const [openedProduct, setOpenedProduct] = useState<ProductItem | null>(null);
  const [openedSection, setOpenedSection] = useState<"features" | "drawings" | "documents" | "description" | null>(null);
  const [isProductLayerAboveQuickOrder, setProductLayerAboveQuickOrder] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<ProductItem | null>(null);
  const [quickOrderQuantity, setQuickOrderQuantity] = useState(1);

  const applyProductUrl = (product: ProductItem) => {
    if (typeof window === "undefined") return;
    window.history.replaceState(window.history.state, "", getProductPagePath(product.sku));
  };

  const restoreCatalogUrl = () => {
    if (typeof window === "undefined") return;
    window.history.replaceState(window.history.state, "", "/#catalog");
  };

  useEffect(() => {
    const legacySku = searchParams.get("product");
    if (!legacySku) return;
    const matched = getProductBySku(legacySku);
    if (matched) {
      router.replace(getProductPagePath(matched.sku));
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("product");
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/");
  }, [router, searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const categoryMatch = selectedCategory === ALL || item.category === selectedCategory;
      const usageTypeMatch = selectedUsageType === ALL || item.usageType === selectedUsageType;
      const colorMatch = selectedColor === ALL || item.color === selectedColor;
      return categoryMatch && usageTypeMatch && colorMatch;
    });
  }, [selectedCategory, selectedUsageType, selectedColor]);

  const availableCategories = useMemo(() => {
    const list = products.filter((item) => {
      const usageTypeMatch = selectedUsageType === ALL || item.usageType === selectedUsageType;
      const colorMatch = selectedColor === ALL || item.color === selectedColor;
      return usageTypeMatch && colorMatch;
    });
    return Array.from(new Set(list.map((item) => item.category)));
  }, [selectedColor, selectedUsageType]);

  const availableUsageTypes = useMemo(() => {
    const list = products.filter((item) => {
      const categoryMatch = selectedCategory === ALL || item.category === selectedCategory;
      const colorMatch = selectedColor === ALL || item.color === selectedColor;
      return categoryMatch && colorMatch;
    });
    return Array.from(new Set(list.map((item) => item.usageType)));
  }, [selectedCategory, selectedColor]);

  const availableColors = useMemo(() => {
    const list = products.filter((item) => {
      const categoryMatch = selectedCategory === ALL || item.category === selectedCategory;
      const usageTypeMatch = selectedUsageType === ALL || item.usageType === selectedUsageType;
      return categoryMatch && usageTypeMatch;
    });
    return Array.from(new Set(list.map((item) => item.color)));
  }, [selectedCategory, selectedUsageType]);

  useEffect(() => {
    if (selectedCategory !== ALL && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(ALL);
    }
  }, [availableCategories, selectedCategory]);

  useEffect(() => {
    if (selectedUsageType !== ALL && !availableUsageTypes.includes(selectedUsageType)) {
      setSelectedUsageType(ALL);
    }
  }, [availableUsageTypes, selectedUsageType]);

  useEffect(() => {
    if (selectedColor !== ALL && !availableColors.includes(selectedColor)) {
      setSelectedColor(ALL);
    }
  }, [availableColors, selectedColor]);

  const colorHexMap = useMemo(
    () =>
      products.reduce<Record<string, string>>((acc, item) => {
        if (!acc[item.color]) acc[item.color] = item.colorHex;
        return acc;
      }, {}),
    [],
  );

  const openProductQuickView = (product: ProductItem, section?: "features" | "drawings" | "documents" | "description") => {
    setOpenedProduct(product);
    setOpenedSection(section ?? null);
    setProductLayerAboveQuickOrder(false);
    applyProductUrl(product);
  };

  const openProductDocsFromQuickOrder = (section: "documents" | "drawings" | "description") => {
    const target = quickOrderProduct;
    if (!target) return;
    setOpenedProduct(target);
    setOpenedSection(section);
    setProductLayerAboveQuickOrder(true);
    applyProductUrl(target);
  };

  const openQuickOrder = (product: ProductItem, quantity = 1) => {
    if (typeof window === "undefined") return;
    const qty = Math.max(1, quantity || 1);
    setQuickOrderProduct(product);
    setQuickOrderQuantity(qty);
    setProductLayerAboveQuickOrder(false);
    const base = getProductQuickOrderPath(product.sku);
    const url = qty > 1 ? `${base}&qty=${qty}` : base;
    window.history.replaceState(window.history.state, "", url);
  };

  const closeProductModal = () => {
    setOpenedProduct(null);
    setOpenedSection(null);
    setProductLayerAboveQuickOrder(false);
    restoreCatalogUrl();
  };

  const closeQuickOrderModal = () => {
    setQuickOrderProduct(null);
    if (typeof window === "undefined") return;
    if (openedProduct) {
      window.history.replaceState(window.history.state, "", getProductPagePath(openedProduct.sku));
    } else {
      restoreCatalogUrl();
    }
  };

  return (
    <section className="section" id="catalog">
      <div className="container">
        <div className="catalog-header-row">
          <div className="catalog-header-copy">
            <h2>{c.title}</h2>
            <p className="section-lead">{c.lead}</p>
          </div>
          <CatalogFilters
            categories={availableCategories}
            usageTypes={availableUsageTypes}
            colors={availableColors}
            colorHexMap={colorHexMap}
            selectedCategory={selectedCategory}
            selectedUsageType={selectedUsageType}
            selectedColor={selectedColor}
            onReset={() => {
              setSelectedCategory(ALL);
              setSelectedUsageType(ALL);
              setSelectedColor(ALL);
            }}
            onCategoryChange={setSelectedCategory}
            onUsageTypeChange={setSelectedUsageType}
            onColorChange={setSelectedColor}
          />
        </div>

        <div className="catalog-summary">
          {c.found} <strong>{filteredProducts.length}</strong> {c.outOf} {products.length}
        </div>

        <div className="catalog-grid">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.sku}
              product={product}
              onOpen={openProductQuickView}
              onQuickOrder={openQuickOrder}
              displayMode={displayMode}
              prioritizeMainImage={index < 4}
            />
          ))}
        </div>
      </div>
      <ProductModal
        product={openedProduct}
        initialSection={openedSection}
        elevateOverQuickOrder={Boolean(quickOrderProduct && openedProduct && isProductLayerAboveQuickOrder)}
        onClose={closeProductModal}
        onSelectProduct={openProductQuickView}
        onQuickOrder={openQuickOrder}
      />
      {quickOrderProduct ? (
        <QuickOrderModal
          product={quickOrderProduct}
          initialQuantity={quickOrderQuantity}
          onClosed={closeQuickOrderModal}
          onOpenProductDocs={openProductDocsFromQuickOrder}
        />
      ) : null}
    </section>
  );
}
