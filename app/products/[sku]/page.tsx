import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ProductPageInteractive } from "@/components/ProductPageInteractive";
import { SiteHeader } from "@/components/SiteHeader";
import { landingContent } from "@/data/landing-content";
import { getProductBySku, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    sku: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const headerContent = landingContent.header;
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const product = getProductBySku(decodedSku);

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
      <Footer />
    </>
  );
}
