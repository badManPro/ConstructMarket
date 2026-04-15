"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptBannerCards = adaptBannerCards;
exports.adaptCategoryShortcuts = adaptCategoryShortcuts;
exports.adaptSearchProducts = adaptSearchProducts;
exports.adaptArticleEntrances = adaptArticleEntrances;
exports.adaptProductDetail = adaptProductDetail;
const routes_1 = require("../../constants/routes");
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function extractArray(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => isRecord(item));
    }
    if (!isRecord(value)) {
        return [];
    }
    const candidates = [value.records, value.list, value.items, value.rows, value.content];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate.filter((item) => isRecord(item));
        }
    }
    return [];
}
function pickString(source, keys, fallback = "") {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return fallback;
}
function pickNumber(source, keys, fallback = 0) {
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
function pickBoolean(source, keys, fallback = false) {
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
function pickStringArray(source, keys, fallback = []) {
    for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) {
            return value.filter((item) => typeof item === "string" && item.trim().length > 0);
        }
    }
    return fallback;
}
function mapSearchProduct(source, favoriteIds) {
    const id = pickString(source, ["id", "productId", "spuId"], `product-${Math.random().toString(36).slice(2, 8)}`);
    const favorites = new Set(favoriteIds);
    return {
        id,
        spuId: pickString(source, ["spuId", "productSpuId"], id),
        skuId: pickString(source, ["skuId", "defaultSkuId"], `${id}-sku`),
        name: pickString(source, ["name", "productName", "title"], "建材商品"),
        cover: pickString(source, ["cover", "coverUrl", "imageUrl", "image"], "建材商品"),
        brand: pickString(source, ["brand", "brandName"], "ConstructMarket"),
        model: pickString(source, ["model", "specName", "specText"], "默认规格"),
        price: pickNumber(source, ["price", "salePrice", "minPrice"], 0),
        unit: pickString(source, ["unit", "unitName"], "件"),
        minOrderQty: pickNumber(source, ["minOrderQty", "minQuantity"], 1),
        salesVolume: pickNumber(source, ["salesVolume", "salesCount"], 0),
        stockStatus: pickString(source, ["stockStatus", "stockDesc"], "现货"),
        tags: pickStringArray(source, ["tags", "serviceTags"], []),
        supportInvoice: pickBoolean(source, ["supportInvoice", "invoiceSupported"], true),
        isFavorite: favorites.has(id),
        categoryId: pickString(source, ["categoryId", "categoryCode"], "all"),
        categoryName: pickString(source, ["categoryName", "categoryLabel"], "建材分类"),
        material: pickString(source, ["material", "materialCode"], "all"),
        coverTone: pickString(source, ["coverTone"], "linear-gradient(135deg, #334155, #64748b)"),
    };
}
function adaptBannerCards(input) {
    return extractArray(input).map((item, index) => ({
        id: pickString(item, ["id", "bannerId"], `banner-${index + 1}`),
        eyebrow: pickString(item, ["eyebrow", "tag", "label"], "精选推荐"),
        title: pickString(item, ["title", "name"], "建材采购专题"),
        subtitle: pickString(item, ["subtitle", "summary", "description"], "真实接口 Banner 数据"),
        actionText: pickString(item, ["actionText", "buttonText"], "立即查看"),
        accent: pickString(item, ["accent", "themeColor"], "linear-gradient(135deg, #f97316, #fb923c)"),
        route: routes_1.ROUTES.searchResult,
        params: {
            keyword: pickString(item, ["keyword", "title"], ""),
        },
    }));
}
function adaptCategoryShortcuts(input) {
    return extractArray(input).map((item, index) => {
        const id = pickString(item, ["id", "categoryId", "code"], `category-${index + 1}`);
        return {
            id,
            name: pickString(item, ["name", "categoryName", "label"], `分类 ${index + 1}`),
            tagline: pickString(item, ["tagline", "summary", "description"], "查看当前类目商品"),
            route: routes_1.ROUTES.category,
            params: {
                categoryId: id,
            },
        };
    });
}
function adaptSearchProducts(input, favoriteIds = []) {
    return extractArray(input).map((item) => mapSearchProduct(item, favoriteIds));
}
function adaptArticleEntrances(input) {
    return extractArray(input).map((item, index) => {
        const id = pickString(item, ["id", "articleId", "newsId"], `article-${index + 1}`);
        const category = pickString(item, ["category", "categoryCode"], "industry_news");
        return {
            id,
            category,
            title: pickString(item, ["title", "name"], "建材资讯"),
            summary: pickString(item, ["summary", "subtitle", "description"], "查看最新建材资讯"),
            route: routes_1.ROUTES.articleDetail,
            params: {
                id,
                category,
            },
        };
    });
}
function adaptProductDetail(detailInput, specsInput, merchantInput, favoriteIds = []) {
    const detail = isRecord(detailInput) ? detailInput : null;
    if (!detail) {
        return null;
    }
    const product = mapSearchProduct(detail, favoriteIds);
    const merchant = isRecord(merchantInput) ? merchantInput : {};
    const specs = extractArray(specsInput).map((item, index) => ({
        groupName: pickString(item, ["groupName", "name"], `规格组 ${index + 1}`),
        options: pickStringArray(item, ["options", "values"], []),
    }));
    return {
        ...product,
        gallery: pickStringArray(detail, ["gallery", "images", "albums"], [product.cover]),
        subtitle: pickString(detail, ["subtitle", "sellingPoint"], product.name),
        description: pickString(detail, ["description", "summary"], "真实接口商品详情"),
        specGroups: specs.length ? specs : [{ groupName: "规格", options: [product.model] }],
        selectedSpecText: pickString(detail, ["selectedSpecText"], "请选择规格"),
        params: extractArray(detail.params).map((item) => ({
            key: pickString(item, ["key", "name"], "参数"),
            value: pickString(item, ["value", "text"], "-"),
        })),
        serviceTags: pickStringArray(detail, ["serviceTags", "tags"], []),
        shopInfo: {
            shopId: pickString(merchant, ["shopId", "merchantId", "id"], "shop-unknown"),
            shopName: pickString(merchant, ["shopName", "merchantName", "name"], "建材商户"),
            score: pickNumber(merchant, ["score", "rate"], 4.8),
        },
        deliveryDesc: pickString(detail, ["deliveryDesc", "deliveryDescription"], "请以商家发货说明为准"),
        recommendedIds: pickStringArray(detail, ["recommendedIds"], []),
    };
}
