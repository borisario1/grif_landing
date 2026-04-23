import source from "@/docs/14_sku_action.json";
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

export const products: ProductItem[] = raw.products.map((item) => {
  const basePrice = extractPrice(item);
  const normalizedFeatures = Object.values(item.features ?? {})
    .filter((feature) => Boolean(feature.value))
    .map((feature) => ({ name: feature.name || "Параметр", value: feature.value ?? "" }));
  const discountModel = calculateDiscountModel(basePrice);

  const images = item.images ?? [];
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

export const catalogMeta = {
  total: products.length,
  categories: Array.from(new Set(products.map((item) => item.category))),
  usageTypes: Array.from(new Set(products.map((item) => item.usageType))),
  colors: Array.from(new Set(products.map((item) => item.color))),
};

export const getProductBySku = (sku: string) => products.find((item) => item.sku === sku);

export const getProductPagePath = (sku: string) => `/products/${encodeURIComponent(sku)}`;
