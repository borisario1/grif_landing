"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductModal } from "@/components/ProductModal";
import { getProductQuickOrderPath, getProductQuickViewPath, productQuickOrderQuery, productQuickViewQuery } from "@/data/products";
import { ProductItem } from "@/types/product";

type ProductPageModalGateProps = {
  product: ProductItem;
};

export function ProductPageModalGate({ product }: ProductPageModalGateProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isQuickView = searchParams.get(productQuickViewQuery.key) === productQuickViewQuery.value;
  const isQuickOrder = searchParams.get(productQuickOrderQuery.key) === productQuickOrderQuery.value;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(productQuickViewQuery.key);
    const query = params.toString();
    const pathNoQuery = pathname ?? "";
    router.replace(query ? `${pathNoQuery}?${query}` : pathNoQuery, { scroll: false });
  };

  const selectProduct = (next: ProductItem) => {
    router.push(getProductQuickViewPath(next.sku), { scroll: false });
  };

  const openQuickOrder = (next: ProductItem, quantity: number) => {
    const path = getProductQuickOrderPath(next.sku);
    const url = quantity > 1 ? `${path}&qty=${quantity}` : path;
    router.push(url, { scroll: false });
  };

  if (!isQuickView || isQuickOrder) return null;

  return <ProductModal product={product} onClose={closeModal} onSelectProduct={selectProduct} onQuickOrder={openQuickOrder} />;
}
