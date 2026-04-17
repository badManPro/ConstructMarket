import { ROUTES } from "../../constants/routes";
import type {
  ArticleEntrance,
  BannerCard,
  BrandFilterOption,
  BrowseProductDetail,
  CategoryShortcut,
  ProductSkuOption,
  SearchProduct,
} from "../../types/models";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => isRecord(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidates = [value.records, value.list, value.items, value.rows, value.content];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => isRecord(item));
    }
  }

  return [];
}

function pickString(source: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function pickNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

function pickBoolean(source: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value === 1;
    }
  }

  return fallback;
}

function pickStringArray(source: Record<string, unknown>, keys: string[], fallback: string[] = []) {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
    if (typeof value === "string" && value.trim()) {
      return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fallback;
}

function parseJsonRecord(value: unknown) {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stripHtmlTags(input: string) {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSkuList(source: Record<string, unknown>) {
  return Array.isArray(source.skuList)
    ? source.skuList.filter((item): item is Record<string, unknown> => isRecord(item))
    : [];
}

function extractSpecSnapshot(source: Record<string, unknown>) {
  const snapshot = isRecord(source.specSnapshot) ? source.specSnapshot : parseJsonRecord(source.specJson);
  return snapshot && isRecord(snapshot) ? snapshot : null;
}

function getSkuOptionValues(source: Record<string, unknown>) {
  const snapshot = extractSpecSnapshot(source);
  const items = snapshot ? extractArray(snapshot.specs) : [];

  return items
    .sort(
      (left, right) =>
        pickNumber(left, ["sortNo"], Number.MAX_SAFE_INTEGER) -
        pickNumber(right, ["sortNo"], Number.MAX_SAFE_INTEGER),
    )
    .map((item) => pickString(item, ["specValue", "value", "name"], ""))
    .filter(Boolean);
}

function getSkuDisplayText(source: Record<string, unknown>) {
  const snapshot = extractSpecSnapshot(source);
  const displayText = snapshot ? pickString(snapshot, ["displayText"], "") : "";

  if (displayText) {
    return displayText;
  }

  const optionValues = getSkuOptionValues(source);
  return optionValues.join(" / ") || pickString(source, ["skuName"], "默认规格");
}

function adaptSkuOptions(input: Record<string, unknown>): ProductSkuOption[] {
  return extractSkuList(input).flatMap((item) => {
    const skuCode = pickString(item, ["skuCode", "id"], "");
    if (!skuCode) {
      return [];
    }

    return [
      {
        skuId: pickString(item, ["id", "skuCode"], skuCode),
        skuCode,
        name: pickString(item, ["skuName"], skuCode),
        displayText: getSkuDisplayText(item),
        optionValues: getSkuOptionValues(item),
        imageUrl: pickString(item, ["imageUrl"], ""),
        price: pickNumber(item, ["salePrice"], 0),
        originalPrice: pickNumber(item, ["marketPrice"], 0) || undefined,
        stock: pickNumber(item, ["stockQty"], 0) || undefined,
      },
    ];
  });
}

function flattenProductRecord(source: Record<string, unknown>) {
  const product = isRecord(source.product) ? source.product : source;
  const skuList = extractSkuList(source);
  const primarySku = skuList[0] ?? {};
  const brandInfo = isRecord(product.brandInfo) ? product.brandInfo : {};
  const categoryInfo = isRecord(product.categoryInfo) ? product.categoryInfo : {};

  return {
    ...source,
    ...product,
    ...primarySku,
    brandName: pickString(brandInfo, ["brandName", "name"], ""),
    categoryName: pickString(categoryInfo, ["categoryName", "name"], ""),
    categoryCode: pickString(categoryInfo, ["categoryCode"], pickString(source, ["categoryCode"], "")),
    merchantId: pickString(product, ["merchantId"], pickString(primarySku, ["merchantId"], pickString(source, ["merchantId"], ""))),
    skuId: pickString(primarySku, ["skuCode", "id"], pickString(source, ["skuCode", "skuId"], "")),
    skuName: pickString(primarySku, ["skuName"], ""),
    imageUrl: pickString(primarySku, ["imageUrl"], pickString(product, ["coverImageUrl", "imageUrl"], "")),
    salePrice: pickNumber(primarySku, ["salePrice"], pickNumber(product, ["salePrice"], 0)),
    marketPrice: pickNumber(primarySku, ["marketPrice"], pickNumber(product, ["marketPrice"], 0)),
    salesQty: pickNumber(primarySku, ["salesQty"], pickNumber(product, ["salesQty"], 0)),
    stockQty: pickNumber(primarySku, ["stockQty"], pickNumber(product, ["stockQty"], 0)),
  };
}

const BANNER_ACCENTS = [
  "linear-gradient(135deg, #ffedd5, #fff7ed)",
  "linear-gradient(135deg, #dbeafe, #eff6ff)",
  "linear-gradient(135deg, #dcfce7, #f0fdf4)",
  "linear-gradient(135deg, #fce7f3, #fdf2f8)",
];

function getBannerLink(item: Record<string, unknown>): {
  linkType: BannerCard["linkType"];
  route?: BannerCard["route"];
  params?: Record<string, string>;
  externalUrl?: string;
} {
  const linkTypeCode = pickString(item, ["linkTypeCode"]).toUpperCase();
  const linkTargetValue = pickString(item, ["linkTargetValue"]);
  const keyword = pickString(item, ["keyword", "bannerTitle", "title"], "");
  const normalizedTarget = linkTargetValue.replace(/^https?:\/\/[^/]+/i, "") || linkTargetValue;

  if (linkTypeCode === "EXTERNAL" && /^https?:\/\//i.test(linkTargetValue)) {
    return {
      linkType: "external",
      route: ROUTES.webview,
      params: {
        url: linkTargetValue,
        title: pickString(item, ["bannerTitle", "title", "name"], "活动详情"),
      },
      externalUrl: linkTargetValue,
    };
  }

  if (linkTypeCode !== "INTERNAL") {
    return keyword
      ? {
          linkType: "internal",
          route: ROUTES.searchResult,
          params: { keyword },
        }
      : {
          linkType: "none",
        };
  }

  if (/^\/products(?:\/)?$/i.test(normalizedTarget)) {
    return {
      linkType: "internal",
      route: ROUTES.searchResult,
    };
  }

  const productDetailMatch =
    normalizedTarget.match(/^\/products?\/([^/?#]+)/i) ??
    normalizedTarget.match(/[?&](?:id|productId)=([^&#]+)/i);

  if (productDetailMatch?.[1]) {
    return {
      linkType: "internal",
      route: ROUTES.productDetail,
      params: {
        id: decodeURIComponent(productDetailMatch[1]),
      },
    };
  }

  const categoryMatch =
    normalizedTarget.match(/^\/categories?\/([^/?#]+)/i) ??
    normalizedTarget.match(/[?&]categoryId=([^&#]+)/i);

  if (categoryMatch?.[1]) {
    return {
      linkType: "internal",
      route: ROUTES.category,
      params: {
        categoryId: decodeURIComponent(categoryMatch[1]),
      },
    };
  }

  if (/category/i.test(normalizedTarget)) {
    return {
      linkType: "internal",
      route: ROUTES.category,
    };
  }

  if (/article/i.test(normalizedTarget)) {
    return {
      linkType: "internal",
      route: ROUTES.articleList,
    };
  }

  return {
    linkType: "internal",
    route: ROUTES.searchResult,
    params: keyword ? { keyword } : undefined,
  };
}

function getBannerEyebrow(item: Record<string, unknown>, linkType: BannerCard["linkType"]) {
  const explicit = pickString(item, ["eyebrow", "tag", "label"]);
  if (explicit) {
    return explicit;
  }

  if (linkType === "external") {
    return "站外活动";
  }

  return "商城精选";
}

function getBannerActionText(
  link: ReturnType<typeof getBannerLink>,
  item: Record<string, unknown>,
) {
  const explicit = pickString(item, ["actionText", "buttonText"]);
  if (explicit) {
    return explicit;
  }

  if (link.linkType === "external") {
    return "立即前往";
  }

  if (link.route === ROUTES.category) {
    return "查看分类";
  }

  if (link.route === ROUTES.productDetail) {
    return "查看商品";
  }

  return "立即查看";
}

function getBannerSubtitle(item: Record<string, unknown>, link: ReturnType<typeof getBannerLink>) {
  const explicit = pickString(item, ["subtitle", "summary", "description", "bannerDesc"]);
  if (explicit) {
    return explicit;
  }

  if (link.linkType === "external") {
    return "点击后将在小程序内打开活动页。";
  }

  if (link.route === ROUTES.searchResult) {
    return "进入商品结果页继续浏览当前活动商品。";
  }

  if (link.route === ROUTES.category) {
    return "进入对应分类页查看当前可售商品。";
  }

  return "查看当前 Banner 对应的活动入口。";
}

function mapSearchProduct(source: Record<string, unknown>, favoriteIds: string[]): SearchProduct {
  const record = flattenProductRecord(source);
  const productRecord = isRecord(source.product) ? source.product : null;
  const productSource = productRecord ?? record;
  const brandInfo = productRecord && isRecord(productRecord.brandInfo) ? productRecord.brandInfo : {};
  const id = pickString(productSource, ["id", "productId", "spuId"], `product-${Math.random().toString(36).slice(2, 8)}`);
  const favorites = new Set(favoriteIds);

  return {
    id,
    spuId: pickString(record, ["spuId", "productSpuId", "productSpuNo"], id),
    skuId: pickString(record, ["skuId", "defaultSkuId", "skuCode"], `${id}-sku`),
    brandId: pickString(record, ["brandId"], pickString(brandInfo, ["id", "brandCode"], "")),
    merchantId: pickString(record, ["merchantId"], ""),
    name: pickString(record, ["name", "productName", "title"], "建材商品"),
    cover: pickString(record, ["cover", "coverUrl", "coverImageUrl", "imageUrl", "image"], "建材商品"),
    brand: pickString(record, ["brand", "brandName"], "ConstructMarket"),
    model: pickString(record, ["model", "skuName", "specName", "specText"], "默认规格"),
    specText: pickString(record, ["specText", "skuName", "model"], ""),
    price: pickNumber(record, ["price", "salePrice", "minPrice", "marketPrice"], 0),
    originalPrice: pickNumber(record, ["originalPrice", "marketPrice"], 0) || undefined,
    unit: pickString(record, ["unit", "unitName"], "件"),
    minOrderQty: pickNumber(record, ["minOrderQty", "minQuantity"], 1),
    salesVolume: pickNumber(record, ["salesVolume", "salesCount", "salesQty"], 0),
    stockStatus:
      pickString(record, ["stockStatus", "stockDesc"], "") || (pickNumber(record, ["stockQty"], 0) > 0 ? "现货" : "待补货"),
    stock: pickNumber(record, ["stock", "stockQty"], 0),
    rating: pickNumber(record, ["rating", "ratingScore"], 0) || undefined,
    tags: pickStringArray(record, ["tags", "serviceTags", "tagNames"], []),
    supportInvoice: pickBoolean(record, ["supportInvoice", "invoiceSupported"], true),
    isFavorite: favorites.has(id) || pickBoolean(record, ["isFavorite", "isFavorited"], false),
    categoryId: pickString(record, ["categoryId", "categoryCode"], "all"),
    categoryName: pickString(record, ["categoryName", "categoryLabel"], "建材分类"),
    material: pickString(record, ["material", "materialCode"], "all"),
    coverTone: pickString(record, ["coverTone"], "linear-gradient(135deg, #334155, #64748b)"),
  };
}

export function adaptBannerCards(input: unknown): BannerCard[] {
  return extractArray(input)
    .filter(
      (item) =>
        pickNumber(item, ["publishStatus"], 1) === 1 && pickNumber(item, ["isDeleted"], 0) === 0,
    )
    .sort(
      (left, right) =>
        pickNumber(left, ["sortNo"], Number.MAX_SAFE_INTEGER) -
        pickNumber(right, ["sortNo"], Number.MAX_SAFE_INTEGER),
    )
    .map((item, index) => {
      const link = getBannerLink(item);

      return {
        id: pickString(item, ["id", "bannerId"], `banner-${index + 1}`),
        eyebrow: getBannerEyebrow(item, link.linkType),
        title: pickString(item, ["title", "name", "bannerTitle"], "建材采购专题"),
        subtitle: getBannerSubtitle(item, link),
        actionText: getBannerActionText(link, item),
        accent: pickString(item, ["accent", "themeColor"], BANNER_ACCENTS[index % BANNER_ACCENTS.length]),
        imageUrl: pickString(item, ["imageUrl", "bannerImageUrl", "coverImageUrl"], ""),
        linkType: link.linkType,
        route: link.route,
        params: link.params,
        externalUrl: link.externalUrl,
      };
    });
}

export function adaptCategoryShortcuts(input: unknown): CategoryShortcut[] {
  return extractArray(input).map((item, index) => {
    const id = pickString(item, ["id", "categoryId", "code"], `category-${index + 1}`);
    const children = extractArray(item.children)
      .map((child) => pickString(child, ["name", "categoryName", "label"], ""))
      .filter(Boolean);

    return {
      id,
      name: pickString(item, ["name", "categoryName", "label"], `分类 ${index + 1}`),
      tagline: pickString(item, ["tagline", "summary", "description"], children.slice(0, 2).join(" / ") || "查看当前类目商品"),
      route: ROUTES.category,
      params: {
        categoryId: id,
      },
    };
  });
}

export function adaptSearchProducts(input: unknown, favoriteIds: string[] = []): SearchProduct[] {
  return extractArray(input).map((item) => mapSearchProduct(item, favoriteIds));
}

export function adaptFavoriteProducts(input: unknown): SearchProduct[] {
  return extractArray(input)
    .sort(
      (left, right) =>
        Date.parse(pickString(right, ["createdAt"], "")) - Date.parse(pickString(left, ["createdAt"], "")),
    )
    .map((item) => ({
      ...mapSearchProduct(item, []),
      isFavorite: true,
    }));
}

export function adaptBrandOptions(input: unknown): BrandFilterOption[] {
  return extractArray(input)
    .map((item) => {
      const id = pickString(item, ["id", "brandId", "brandCode"], "");
      const name = pickString(item, ["brandName", "name"], "");

      if (!id || !name) {
        return null;
      }

      return { id, name };
    })
    .filter((item): item is BrandFilterOption => Boolean(item));
}

export function adaptArticleEntrances(input: unknown): ArticleEntrance[] {
  const items = Array.isArray(input)
    ? input
    : isRecord(input)
      ? [
          ...extractArray(input.industryNews),
          ...extractArray(input.productKnowledge),
          ...extractArray(input.decorationGuides),
        ]
      : [];

  return items.map((item, index) => {
    const id = pickString(item, ["id", "articleId", "newsId"], `article-${index + 1}`);
    const categoryCode = pickString(item, ["category", "categoryCode"], "industry_news");
    const categoryLabel =
      {
        industry_news: "行业新闻",
        product_knowledge: "产品知识",
        renovation_guide: "装修指南",
      }[categoryCode] ?? categoryCode;

    return {
      id,
      category: categoryLabel,
      title: pickString(item, ["title", "name", "titleText"], "建材资讯"),
      summary: pickString(item, ["summary", "subtitle", "description", "summaryText"], "查看最新建材资讯"),
      route: ROUTES.articleDetail,
      params: {
        id,
        category: categoryCode,
      },
    };
  });
}

export function adaptProductDetail(
  detailInput: unknown,
  specsInput: unknown,
  merchantInput: unknown,
  favoriteIds: string[] = [],
): BrowseProductDetail | null {
  const detail = isRecord(detailInput) ? detailInput : null;
  if (!detail) {
    return null;
  }

  const product = mapSearchProduct(detail, favoriteIds);
  const detailMerchant = isRecord(detail.merchant) ? detail.merchant : {};
  const merchant = isRecord(merchantInput) ? merchantInput : detailMerchant;
  const specGroupsInput =
    isRecord(specsInput) && Array.isArray(specsInput.specs) ? specsInput.specs : specsInput;
  const specs = extractArray(specGroupsInput).map((item, index) => ({
    groupName: pickString(item, ["specName", "groupName", "name"], `规格组 ${index + 1}`),
    options: extractArray(item.values)
      .sort(
        (left, right) =>
          pickNumber(left, ["sortNo"], Number.MAX_SAFE_INTEGER) -
          pickNumber(right, ["sortNo"], Number.MAX_SAFE_INTEGER),
      )
      .map((valueItem) => pickString(valueItem, ["specValue", "value", "name"], ""))
      .filter(Boolean),
  }));
  const skuOptions = adaptSkuOptions(detail);
  const serviceTags = uniqueStrings([
    ...pickStringArray(detail, ["serviceTags", "tags", "tagNames"]),
    ...pickStringArray(merchant, ["merchantTags"]),
  ]);
  const fallbackParams = uniqueStrings([
    product.brand ? `品牌:${product.brand}` : "",
    product.categoryName ? `分类:${product.categoryName}` : "",
    skuOptions[0]?.skuCode ? `SKU:${skuOptions[0].skuCode}` : "",
  ]).map((item) => {
    const [key, value] = item.split(":");
    return {
      key,
      value,
    };
  });
  const freightAmount = pickNumber(detail, ["freightAmount"], 0);

  return {
    ...product,
    gallery: pickStringArray(detail, ["gallery", "images", "albums"], []).length
      ? pickStringArray(detail, ["gallery", "images", "albums"])
      : pickStringArray(isRecord(detail.product) ? detail.product : detail, ["imageAlbum"], [product.cover]),
    subtitle: pickString(detail, ["subtitle", "sellingPoint"], "") ||
      pickString(isRecord(detail.product) ? detail.product : detail, ["productSubtitle", "subtitle", "sellingPoint"], product.name),
    description: stripHtmlTags(
      pickString(detail, ["detailContent", "description", "summary"], "") ||
        pickString(isRecord(detail.product) ? detail.product : detail, ["detailContent", "description", "summary"], "真实接口商品详情"),
    ),
    specGroups: specs.length ? specs : [{ groupName: "规格", options: [product.model] }],
    skuOptions,
    selectedSpecText: skuOptions.length === 1 ? skuOptions[0].displayText : "请选择规格",
    params: extractArray(detail.params).length
      ? extractArray(detail.params).map((item) => ({
          key: pickString(item, ["key", "name"], "参数"),
          value: pickString(item, ["value", "text"], "-"),
        }))
      : fallbackParams,
    serviceTags: serviceTags.length ? serviceTags : product.tags,
    shopInfo: {
      shopId: pickString(merchant, ["shopId", "merchantId", "id"], "shop-unknown"),
      shopName: pickString(merchant, ["shopName", "merchantName", "merchantShortName", "name"], "建材商户"),
      score: pickNumber(merchant, ["score", "ratingScore", "rate"], 4.8),
    },
    deliveryDesc:
      pickString(detail, ["deliveryDesc", "deliveryDescription"], "") ||
      (freightAmount > 0 ? `预计运费 ¥${freightAmount}，请以下单页最终金额为准。` : "请以商家发货说明为准"),
    recommendedIds: pickStringArray(detail, ["recommendedIds"], []),
  };
}
