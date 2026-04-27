export type ProductPrice = {
  currency: string;
  amount: number;
};

export type ProductDrawing = {
  type: string;
  urls: string[];
};

export type ProductDocument = {
  title: string;
  url: string;
};

export type ProductFeature = {
  name: string;
  value: string;
};

export type ProductItem = {
  sku: string;
  name: string;
  brand: string;
  count: number;
  status: string;
  price: ProductPrice;
  oldPrice: ProductPrice;
  newPrice: ProductPrice;
  discountPercent: number;
  saving: number;
  link: string;
  description: string;
  normalizedDescription: string;
  images: string[];
  cardImages: string[];
  thumbImages: string[];
  drawings: ProductDrawing[];
  documents: ProductDocument[];
  features: ProductFeature[];
  category: string;
  usageType: string;
  color: string;
  colorHex: string;
  topBenefits: string[];
  keyFeatures: ProductFeature[];
  mainImageIndex: number;
};
