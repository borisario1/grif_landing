#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import source from "../docs/14_sku_action.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARD_DIR = path.join(ROOT, "public", "media-cache", "card");
const THUMB_DIR = path.join(ROOT, "public", "media-cache", "thumb");
const MAP_FILE = path.join(ROOT, "data", "media-cache-map.json");

const CARD_SIZE = 960;
const THUMB_SIZE = 120;
const QUALITY = 78;

const isHttpUrl = (value) => /^https?:\/\//i.test(value);
const fileId = (url) => crypto.createHash("sha1").update(url).digest("hex");

const toWebp = async (buffer, targetPath, size) => {
  await sharp(buffer)
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(targetPath);
};

const uniqueImageUrls = () => {
  const urls = new Set();
  for (const product of source.products ?? []) {
    for (const image of product.images ?? []) {
      if (isHttpUrl(image)) urls.add(image);
    }
  }
  return Array.from(urls);
};

const ensureDirs = async () => {
  await fs.mkdir(CARD_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
};

const build = async () => {
  await ensureDirs();
  const urls = uniqueImageUrls();
  const map = {};

  for (const url of urls) {
    const id = fileId(url);
    const cardName = `${id}.webp`;
    const thumbName = `${id}.webp`;
    const cardPath = path.join(CARD_DIR, cardName);
    const thumbPath = path.join(THUMB_DIR, thumbName);
    const cardPublic = `/media-cache/card/${cardName}`;
    const thumbPublic = `/media-cache/thumb/${thumbName}`;

    map[url] = { card: cardPublic, thumb: thumbPublic };

    const cardExists = await fs
      .access(cardPath)
      .then(() => true)
      .catch(() => false);
    const thumbExists = await fs
      .access(thumbPath)
      .then(() => true)
      .catch(() => false);
    if (cardExists && thumbExists) continue;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Skipping ${url}: HTTP ${response.status}`);
      continue;
    }
    const data = Buffer.from(await response.arrayBuffer());

    if (!cardExists) {
      await toWebp(data, cardPath, CARD_SIZE);
    }
    if (!thumbExists) {
      await toWebp(data, thumbPath, THUMB_SIZE);
    }
  }

  await fs.writeFile(MAP_FILE, `${JSON.stringify(map, null, 2)}\n`, "utf8");
  console.log(`Media cache updated for ${Object.keys(map).length} images.`);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
