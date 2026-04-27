import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ProductPageInteractive } from "@/components/ProductPageInteractive";
import { ProductPageQuickOrderGate } from "@/components/ProductPageQuickOrderGate";
import { SiteHeader } from "@/components/SiteHeader";
import { landingContent } from "@/data/landing-content";
import { getProductByIdentifier, getProductBySku, getProductPagePath, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    sku: string;
  }>;
};

const formatAmount = (amount: number) => Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount);

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

const buildMetaDescription = (sku: string) => {
  const product = getProductByIdentifier(sku) ?? getProductBySku(sku);
  if (!product) return "Оригинальные смесители PAINI с доставкой по всей России.";
  const featurePart = product.keyFeatures
    .slice(0, 3)
    .map((feature) => `${feature.name}: ${feature.value}`)
    .join(" · ");
  return `${buildDisplayName(product.name, product.sku)} (${product.sku}). Цена по акции: ${formatAmount(product.newPrice.amount)} ${product.newPrice.currency}, было ${formatAmount(product.oldPrice.amount)} ${product.oldPrice.currency}, выгода ${formatAmount(product.saving)} ₽. Доставка по всей России.${featurePart ? ` ${featurePart}.` : ""}`;
};

const buildAbsoluteUrl = (pathOrUrl: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paini.grifmaster.ru";
  try {
    return new URL(pathOrUrl, siteUrl).toString();
  } catch {
    return pathOrUrl;
  }
};

export function generateStaticParams() {
  return products.map((item) => ({
    sku: getProductPagePath(item.sku).replace("/products/", ""),
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const product = getProductByIdentifier(decodedSku) ?? getProductBySku(decodedSku);
  if (!product) {
    return {
      title: "Товар не найден | PAINI",
      description: "Карточка товара не найдена.",
    };
  }
  const name = buildDisplayName(product.name, product.sku);
  const title = `${name} (${product.sku}) — ${formatAmount(product.newPrice.amount)} ${product.newPrice.currency} | PAINI`;
  const socialTitle = `${name} — ${formatAmount(product.newPrice.amount)} ${product.newPrice.currency}`;
  const description = buildMetaDescription(decodedSku);
  const ogImage = product.cardImages[product.mainImageIndex] ?? product.cardImages[0] ?? product.images[product.mainImageIndex] ?? product.images[0];
  const absoluteOgImage = ogImage ? buildAbsoluteUrl(ogImage) : undefined;
  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      type: "website",
      locale: "ru_RU",
      images: absoluteOgImage ? [{ url: absoluteOgImage, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: absoluteOgImage ? [absoluteOgImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const headerContent = landingContent.header;
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const product = getProductByIdentifier(decodedSku) ?? getProductBySku(decodedSku);

  if (!product) {
    notFound();
  }

  const recommendedProducts = products.filter((item) => item.sku !== product.sku).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container product-page">
          <nav className="breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/" className="crumb-home" aria-label="Главная">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/#catalog">{headerContent.nav.catalog}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{product.name}</span>
          </nav>

          <ProductPageInteractive product={product} recommendedProducts={recommendedProducts} />
        </div>
      </main>
      <Suspense fallback={null}>
        <ProductPageQuickOrderGate product={product} />
      </Suspense>
      <Footer />
    </>
  );
}
