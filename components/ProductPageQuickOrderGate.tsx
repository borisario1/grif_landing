"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuickOrderModal, type QuickOrderProductDocSection } from "@/components/QuickOrderModal";
import { productQuickOrderQuery } from "@/data/products";
import { ProductItem } from "@/types/product";

type ProductPageQuickOrderGateProps = {
  product: ProductItem;
};

export function ProductPageQuickOrderGate({ product }: ProductPageQuickOrderGateProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isQuickOrder = searchParams.get(productQuickOrderQuery.key) === productQuickOrderQuery.value;
  const requestedQty = Number(searchParams.get("qty") ?? "1");
  const initialQuantity = Number.isFinite(requestedQty) ? Math.max(1, Math.floor(requestedQty)) : 1;

  const stripQuickOrderFromUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(productQuickOrderQuery.key);
    const query = params.toString();
    const pathNoQuery = pathname ?? "";
    router.replace(query ? `${pathNoQuery}?${query}` : pathNoQuery, { scroll: false });
  };

  const openProductDocSection = (section: QuickOrderProductDocSection) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(productQuickOrderQuery.key);
    params.delete("qty");
    const query = params.toString();
    const hash =
      section === "documents" ? "product-documents" : section === "drawings" ? "product-drawings" : "product-description";
    const base = pathname ?? "";
    const url = `${base}${query ? `?${query}` : ""}#${hash}`;
    router.replace(url, { scroll: false });
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!isQuickOrder) return null;

  return (
    <QuickOrderModal
      product={product}
      initialQuantity={initialQuantity}
      onClosed={stripQuickOrderFromUrl}
      onOpenProductDocs={openProductDocSection}
    />
  );
}
