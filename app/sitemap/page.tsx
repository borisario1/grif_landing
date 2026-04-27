import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getProductPagePath, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Карта сайта | PAINI",
  description: "Карта сайта PAINI: разделы, карточки товаров и технические XML/JSON фиды.",
};

export default function SitemapPage() {
  return (
    <main>
      <SiteHeader />
      <section className="section">
        <div className="container sitemap-page">
          <h1>Карта сайта</h1>
          <p className="section-lead">
            Быстрые ссылки по разделам, карточкам товаров и техническим файлам для поисковых систем и интеграций.
          </p>

          <div className="sitemap-grid">
            <article className="sitemap-card">
              <h2>Разделы сайта</h2>
              <ul>
                <li>
                  <Link href="/">Главная</Link>
                </li>
                <li>
                  <Link href="/#catalog">Каталог</Link>
                </li>
                <li>
                  <Link href="/#faq">FAQ</Link>
                </li>
              </ul>
            </article>

            <article className="sitemap-card">
              <h2>Технические файлы</h2>
              <ul>
                <li>
                  <a href="/sitemap.xml" target="_blank" rel="noreferrer">
                    Sitemap XML
                  </a>
                </li>
                <li>
                  <a href="/yandex-feed.xml" target="_blank" rel="noreferrer">
                    Yandex Feed XML
                  </a>
                </li>
                <li>
                  <a href="/product-catalog.xml" target="_blank" rel="noreferrer">
                    Каталог товаров XML
                  </a>
                </li>
                <li>
                  <a href="/product-catalog.json" target="_blank" rel="noreferrer">
                    Каталог товаров JSON
                  </a>
                </li>
              </ul>
            </article>
          </div>

          <article className="sitemap-card sitemap-products">
            <h2>Товары</h2>
            <ul>
              {products.map((product) => (
                <li key={product.sku}>
                  <Link href={getProductPagePath(product.sku)}>
                    {product.sku} — {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
