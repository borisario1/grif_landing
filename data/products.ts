import source from "@/docs/14_sku_action.json";
import mediaCacheMap from "@/data/media-cache-map.json";
import { ProductItem } from "@/types/product";

export type CatalogDisplayMode = "more_goods" | "more_info";

type CatalogUiConfig = {
  manualMainImageEnabled: boolean;
  defaultMainImageNumber: number;
  customMainImageBySku: Record<string, number>;
  showDisplayModeToggleWhenManual: boolean;
  defaultDisplayMode: CatalogDisplayMode;
  modalAutoplayEnabled: boolean;
  modalAutoplayIntervalMs: number;
  modalPauseOnHover: boolean;
  cardHoverMainImageSwapEnabled: boolean;
};

type RawProduct = {
  sku: string;
  name: string;
  brand: string;
  count: string;
  status: string;
  prices?: {
    price?: Array<{
      type: string;
      value: {
        currency: string;
        amount: number;
      };
    }>;
  };
  link: string;
  description: string;
  images?: string[];
  drawings?: Array<{ type: string; urls: string[] }>;
  documents?: Array<{ title: string; url: string }>;
  features?: Record<string, { name?: string; value?: string }>;
};

type RawJson = {
  products: RawProduct[];
};

const raw = source as unknown as RawJson;

export const catalogUiConfig: CatalogUiConfig = {
  manualMainImageEnabled: true,
  defaultMainImageNumber: 3,
  customMainImageBySku: {
    "MECR205/574": 1,
  },
  showDisplayModeToggleWhenManual: true,
  defaultDisplayMode: "more_goods",
  modalAutoplayEnabled: true,
  modalAutoplayIntervalMs: 5000,
  modalPauseOnHover: true,
  cardHoverMainImageSwapEnabled: true,
};

const normalizeCategory = (product: RawProduct): string => {
  const destination = product.features?.obshchee_naznachenie?.value?.toLowerCase() ?? "";
  if (destination.includes("кух")) return "Кухня";
  if (destination.includes("ван")) return "Ванная";
  if (destination.includes("туал")) return "Туалет";
  return "Прочее";
};

const normalizeUsageType = (product: RawProduct): string => {
  const spoutType = product.features?.tip_izliva?.value?.toLowerCase() ?? "";
  const name = product.name.toLowerCase();
  if (spoutType.includes("выдвиж") || name.includes("выдвиж")) return "Выдвижной излив";
  if (spoutType.includes("фильтр") || name.includes("3 воды")) return "С подводом фильтра";
  if (name.includes("гигиен")) return "Гигиенический душ";
  return "Стандарт";
};

const normalizeColor = (product: RawProduct): string => {
  const color = product.features?.tsvet_izdeliya?.value ?? "";
  if (!color) return "Не указан";
  return color;
};

const normalizeColorHex = (color: string): string => {
  const normalized = color.toLowerCase();
  if (normalized.includes("чер")) return "#1f2937";
  if (normalized.includes("бел")) return "#f8fafc";
  if (normalized.includes("хром")) return "#cbd5e1";
  if (normalized.includes("беж")) return "#d6bfa2";
  if (normalized.includes("золот")) return "#d4af37";
  return "#94a3b8";
};

const buildTopBenefits = (product: RawProduct): string[] => {
  const list: string[] = [];
  const warranty = product.features?.garantiya?.value;
  const material = product.features?.material_korpusa?.value;
  const country = product.features?.strana_proizvoditel?.value;
  const cartridge = product.features?.kartridzh_n?.value;
  if (country) list.push(country);
  if (warranty) list.push(`Гарантия ${warranty}`);
  if (material) list.push(material);
  if (cartridge) list.push(`Картридж ${cartridge}`);
  return list.slice(0, 4);
};

const extractPrice = (product: RawProduct) => {
  const retail = product.prices?.price?.find((item) => item.type === "retail");
  const fallback = product.prices?.price?.[0];
  return retail?.value ?? fallback?.value ?? { currency: "руб.", amount: 0 };
};

const DISCOUNT_PERCENT = 30;

const calculateDiscountModel = (price: { currency: string; amount: number }) => {
  const oldAmount = price.amount;
  const newAmount = Math.round(oldAmount * 0.7);
  const saving = oldAmount - newAmount;
  return {
    oldPrice: { currency: price.currency, amount: oldAmount },
    newPrice: { currency: price.currency, amount: newAmount },
    discountPercent: DISCOUNT_PERCENT,
    saving,
  };
};

const normalizeDescription = (description: string) => {
  const sanitized = description
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();

  const paragraphs = sanitized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/[ \t]{2,}/g, " ").trim())
    .filter(Boolean);

  // Remove repeated marketing blocks that sometimes duplicate in source JSON.
  const uniqueParagraphs: string[] = [];
  const seen = new Set<string>();
  for (const paragraph of paragraphs) {
    const dedupeKey = paragraph.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    uniqueParagraphs.push(paragraph);
  }

  return uniqueParagraphs.join("\n\n");
};

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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['"`]+/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildSkuToken = (sku: string) =>
  sku
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildSlugFromLink = (link: string) => {
  try {
    const pathname = new URL(link).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
    return slugify(lastSegment);
  } catch {
    return "";
  }
};

const buildKeyFeatures = (
  features: Array<{
    name: string;
    value: string;
  }>,
) => {
  const importantKeywords = ["Гарантия", "Материал корпуса", "Страна изготовитель", "Картридж", "Тип излива", "Монтаж"];
  const selected = importantKeywords
    .map((keyword) => features.find((item) => item.name === keyword))
    .filter((item): item is { name: string; value: string } => Boolean(item));
  return selected.slice(0, 7);
};

const resolveMainImageIndex = (product: RawProduct, imageCount: number) => {
  if (!catalogUiConfig.manualMainImageEnabled || imageCount === 0) {
    return 0;
  }
  const mainImageNumber = catalogUiConfig.customMainImageBySku[product.sku] ?? catalogUiConfig.defaultMainImageNumber;
  const normalizedIndex = Math.max(0, mainImageNumber - 1);
  return Math.min(normalizedIndex, imageCount - 1);
};

const getCachedCardImage = (url: string) => mediaCacheMap[url as keyof typeof mediaCacheMap]?.card ?? url;
const getCachedThumbImage = (url: string) => mediaCacheMap[url as keyof typeof mediaCacheMap]?.thumb ?? url;

export const products: ProductItem[] = raw.products.map((item) => {
  const basePrice = extractPrice(item);
  const normalizedFeatures = Object.values(item.features ?? {})
    .filter((feature) => Boolean(feature.value))
    .map((feature) => ({ name: feature.name || "Параметр", value: feature.value ?? "" }));
  const discountModel = calculateDiscountModel(basePrice);

  const images = item.images ?? [];
  const cardImages = images.map(getCachedCardImage);
  const thumbImages = images.map(getCachedThumbImage);
  return {
    sku: item.sku,
    name: item.name,
    brand: item.brand,
    count: Number(item.count),
    status: item.status,
    price: discountModel.newPrice,
    oldPrice: discountModel.oldPrice,
    newPrice: discountModel.newPrice,
    discountPercent: discountModel.discountPercent,
    saving: discountModel.saving,
    link: item.link,
    description: item.description,
    normalizedDescription: normalizeDescription(item.description),
    images,
    cardImages,
    thumbImages,
    drawings: item.drawings ?? [],
    documents: (item.documents ?? []).map((doc) => ({ title: doc.title, url: doc.url })),
    features: normalizedFeatures,
    category: normalizeCategory(item),
    usageType: normalizeUsageType(item),
    color: normalizeColor(item),
    colorHex: normalizeColorHex(normalizeColor(item)),
    topBenefits: buildTopBenefits(item),
    keyFeatures: buildKeyFeatures(normalizedFeatures),
    mainImageIndex: resolveMainImageIndex(item, images.length),
  };
});

const productSlugMap = new Map(
  raw.products.map((item) => {
    const skuToken = buildSkuToken(item.sku);
    const linkSlug = buildSlugFromLink(item.link);
    const fallbackNameSlug = slugify(buildDisplayName(item.name, item.sku));
    const composed = linkSlug || (fallbackNameSlug ? `${skuToken}-${fallbackNameSlug}` : skuToken);
    return [item.sku, composed];
  }),
);

export const catalogMeta = {
  total: products.length,
  categories: Array.from(new Set(products.map((item) => item.category))),
  usageTypes: Array.from(new Set(products.map((item) => item.usageType))),
  colors: Array.from(new Set(products.map((item) => item.color))),
};

export const getProductBySku = (sku: string) => products.find((item) => item.sku === sku);

export const getProductByIdentifier = (identifier: string) => {
  const decoded = decodeURIComponent(identifier).trim();
  if (!decoded) return undefined;
  const direct = getProductBySku(decoded);
  if (direct) return direct;
  const normalized = decoded.toLowerCase().replace(/^-+|-+$/g, "");
  const bySlug = products.find((item) => productSlugMap.get(item.sku) === normalized);
  if (bySlug) return bySlug;
  const bySkuToken = products.find((item) => buildSkuToken(item.sku) === normalized || normalized.startsWith(`${buildSkuToken(item.sku)}-`));
  if (bySkuToken) return bySkuToken;
  return undefined;
};

export const getProductPagePath = (sku: string) => {
  const slug = productSlugMap.get(sku);
  return `/products/${encodeURIComponent(slug ?? sku)}`;
};

/** Query flag on `/products/.../` — same HTML/meta as full card; reopen via shared link (static export–friendly). */
export const productQuickViewQuery = { key: "modal", value: "1" } as const;

export const getProductQuickViewPath = (sku: string) => {
  const base = getProductPagePath(sku).replace(/\/+$/, "");
  return `${base}/?${productQuickViewQuery.key}=${productQuickViewQuery.value}`;
};

/** Быстрый заказ по товару: тот же путь и мета, что у карточки; повторное открытие по ссылке. */
export const productQuickOrderQuery = { key: "quickOrder", value: "1" } as const;

export const getProductQuickOrderPath = (sku: string) => {
  const base = getProductPagePath(sku).replace(/\/+$/, "");
  return `${base}/?${productQuickOrderQuery.key}=${productQuickOrderQuery.value}`;
};
