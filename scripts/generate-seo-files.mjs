import fs from "node:fs/promises";
import source from "../docs/14_sku_action.json" with { type: "json" };

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://paini.grifmaster.ru").replace(/\/+$/, "");
const OUT_DIR = new URL("../public/", import.meta.url);
const NOW = new Date().toISOString();

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/['"`]+/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildSkuToken = (sku) =>
  sku
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const slugFromLink = (link) => {
  try {
    const pathname = new URL(link).pathname;
    const last = pathname.split("/").filter(Boolean).pop() ?? "";
    return toSlug(last);
  } catch {
    return "";
  }
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const rawProducts = source.products ?? [];
const products = rawProducts.map((item) => {
  const linkSlug = slugFromLink(item.link ?? "");
  const fallbackSlug = `${buildSkuToken(item.sku)}-${toSlug(item.name ?? "")}`.replace(/-+$/, "");
  const slug = linkSlug || fallbackSlug || buildSkuToken(item.sku);
  const productPath = `/products/${encodeURIComponent(slug)}/`;
  const price = item.prices?.price?.find((p) => p.type === "retail")?.value ?? item.prices?.price?.[0]?.value ?? { amount: 0, currency: "руб." };
  const oldPrice = Number(price.amount) || 0;
  const newPrice = Math.round(oldPrice * 0.7);
  const category = item.features?.obshchee_naznachenie?.value || "Смесители";
  const images = item.images ?? [];
  return {
    sku: item.sku,
    name: item.name,
    brand: item.brand || "PAINI",
    description: (item.description || "").replace(/\s+/g, " ").trim(),
    category,
    available: Number(item.count || 0) > 0,
    oldPrice,
    newPrice,
    currency: "RUR",
    productPath,
    url: `${BASE_URL}${productPath}`,
    image: images[0] || "",
    images,
  };
});

const sitemapEntries = [`${BASE_URL}/`, `${BASE_URL}/sitemap/`, ...products.map((p) => p.url)];
const uniqueSitemapEntries = Array.from(new Set(sitemapEntries));

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueSitemapEntries
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.endsWith("/") && !url.includes("/products/") ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const categories = Array.from(new Set(products.map((p) => p.category))).map((name, index) => ({ id: index + 1, name }));
const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

const ymlXml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${escapeXml(NOW)}">
  <shop>
    <name>PAINI Grifmaster</name>
    <company>ООО "ГРЕНЕЛЬ"</company>
    <url>${escapeXml(BASE_URL)}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
${categories.map((c) => `      <category id="${c.id}">${escapeXml(c.name)}</category>`).join("\n")}
    </categories>
    <offers>
${products
  .map((p) => {
    const pics = p.images.slice(0, 10).map((src) => `        <picture>${escapeXml(src)}</picture>`).join("\n");
    return `      <offer id="${escapeXml(p.sku)}" available="${p.available ? "true" : "false"}">
        <url>${escapeXml(p.url)}</url>
        <price>${p.newPrice}</price>
        <oldprice>${p.oldPrice}</oldprice>
        <currencyId>${p.currency}</currencyId>
        <categoryId>${categoryIdByName.get(p.category) ?? 1}</categoryId>
${pics}
        <name>${escapeXml(p.name)}</name>
        <vendor>${escapeXml(p.brand)}</vendor>
        <description>${escapeXml(p.description)}</description>
      </offer>`;
  })
  .join("\n")}
    </offers>
  </shop>
</yml_catalog>
`;

const catalogXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog generatedAt="${escapeXml(NOW)}" baseUrl="${escapeXml(BASE_URL)}">
${products
  .map(
    (p) => `  <product sku="${escapeXml(p.sku)}" available="${p.available ? "true" : "false"}">
    <name>${escapeXml(p.name)}</name>
    <brand>${escapeXml(p.brand)}</brand>
    <url>${escapeXml(p.url)}</url>
    <category>${escapeXml(p.category)}</category>
    <price currency="${p.currency}">${p.newPrice}</price>
    <oldPrice currency="${p.currency}">${p.oldPrice}</oldPrice>
  </product>`,
  )
  .join("\n")}
</catalog>
`;

const catalogJson = {
  generatedAt: NOW,
  baseUrl: BASE_URL,
  total: products.length,
  products: products.map((p) => ({
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    available: p.available,
    url: p.url,
    category: p.category,
    price: p.newPrice,
    oldPrice: p.oldPrice,
    currency: p.currency,
    image: p.image,
  })),
};

await fs.mkdir(OUT_DIR, { recursive: true });
await Promise.all([
  fs.writeFile(new URL("sitemap.xml", OUT_DIR), sitemapXml, "utf8"),
  fs.writeFile(new URL("yandex-feed.xml", OUT_DIR), ymlXml, "utf8"),
  fs.writeFile(new URL("product-catalog.xml", OUT_DIR), catalogXml, "utf8"),
  fs.writeFile(new URL("product-catalog.json", OUT_DIR), JSON.stringify(catalogJson, null, 2), "utf8"),
]);

console.log(`SEO files generated: sitemap.xml, yandex-feed.xml, product-catalog.xml, product-catalog.json (${products.length} products)`);
