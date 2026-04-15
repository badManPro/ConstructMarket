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
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
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
        if (typeof value === "string" && value.trim()) {
            return value
                .split(/[,\n]/)
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    return fallback;
}
function flattenProductRecord(source) {
    const product = isRecord(source.product) ? source.product : source;
    const skuList = Array.isArray(source.skuList)
        ? source.skuList.filter((item) => isRecord(item))
        : [];
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
        skuId: pickString(primarySku, ["id", "skuCode"], pickString(source, ["skuId"], "")),
        skuName: pickString(primarySku, ["skuName"], ""),
        imageUrl: pickString(primarySku, ["imageUrl"], pickString(product, ["coverImageUrl", "imageUrl"], "")),
        salePrice: pickNumber(primarySku, ["salePrice"], pickNumber(product, ["salePrice"], 0)),
        salesQty: pickNumber(primarySku, ["salesQty"], pickNumber(product, ["salesQty"], 0)),
        stockQty: pickNumber(primarySku, ["stockQty"], pickNumber(product, ["stockQty"], 0)),
    };
}
function getBannerRoute(item) {
    const linkTypeCode = pickString(item, ["linkTypeCode"]).toUpperCase();
    const linkTargetValue = pickString(item, ["linkTargetValue"]);
    const keyword = pickString(item, ["keyword", "bannerTitle", "title"], "");
    if (linkTypeCode === "INTERNAL" && /category/i.test(linkTargetValue)) {
        return {
            route: routes_1.ROUTES.category,
        };
    }
    return {
        route: routes_1.ROUTES.searchResult,
        params: keyword ? { keyword } : undefined,
    };
}
function mapSearchProduct(source, favoriteIds) {
    const record = flattenProductRecord(source);
    const productSource = isRecord(source.product) ? source.product : record;
    const id = pickString(productSource, ["id", "productId", "spuId"], `product-${Math.random().toString(36).slice(2, 8)}`);
    const favorites = new Set(favoriteIds);
    return {
        id,
        spuId: pickString(record, ["spuId", "productSpuId", "productSpuNo"], id),
        skuId: pickString(record, ["skuId", "defaultSkuId", "skuCode"], `${id}-sku`),
        name: pickString(record, ["name", "productName", "title"], "建材商品"),
        cover: pickString(record, ["cover", "coverUrl", "coverImageUrl", "imageUrl", "image"], "建材商品"),
        brand: pickString(record, ["brand", "brandName"], "ConstructMarket"),
        model: pickString(record, ["model", "skuName", "specName", "specText"], "默认规格"),
        price: pickNumber(record, ["price", "salePrice", "minPrice", "marketPrice"], 0),
        unit: pickString(record, ["unit", "unitName"], "件"),
        minOrderQty: pickNumber(record, ["minOrderQty", "minQuantity"], 1),
        salesVolume: pickNumber(record, ["salesVolume", "salesCount", "salesQty"], 0),
        stockStatus: pickString(record, ["stockStatus", "stockDesc"], "") || (pickNumber(record, ["stockQty"], 0) > 0 ? "现货" : "待补货"),
        tags: pickStringArray(record, ["tags", "serviceTags", "tagNames"], []),
        supportInvoice: pickBoolean(record, ["supportInvoice", "invoiceSupported"], true),
        isFavorite: favorites.has(id) || pickBoolean(record, ["isFavorite", "isFavorited"], false),
        categoryId: pickString(record, ["categoryId", "categoryCode"], "all"),
        categoryName: pickString(record, ["categoryName", "categoryLabel"], "建材分类"),
        material: pickString(record, ["material", "materialCode"], "all"),
        coverTone: pickString(record, ["coverTone"], "linear-gradient(135deg, #334155, #64748b)"),
    };
}
function adaptBannerCards(input) {
    return extractArray(input).map((item, index) => {
        const routeConfig = getBannerRoute(item);
        return {
            id: pickString(item, ["id", "bannerId"], `banner-${index + 1}`),
            eyebrow: pickString(item, ["eyebrow", "tag", "label", "linkTypeCode"], "精选推荐"),
            title: pickString(item, ["title", "name", "bannerTitle"], "建材采购专题"),
            subtitle: pickString(item, ["subtitle", "summary", "description", "bannerDesc"], "真实接口 Banner 数据"),
            actionText: pickString(item, ["actionText", "buttonText"], "立即查看"),
            accent: pickString(item, ["accent", "themeColor"], "linear-gradient(135deg, #f97316, #fb923c)"),
            route: routeConfig.route,
            params: routeConfig.params,
        };
    });
}
function adaptCategoryShortcuts(input) {
    return extractArray(input).map((item, index) => {
        const id = pickString(item, ["id", "categoryId", "code"], `category-${index + 1}`);
        const children = extractArray(item.children)
            .map((child) => pickString(child, ["name", "categoryName", "label"], ""))
            .filter(Boolean);
        return {
            id,
            name: pickString(item, ["name", "categoryName", "label"], `分类 ${index + 1}`),
            tagline: pickString(item, ["tagline", "summary", "description"], children.slice(0, 2).join(" / ") || "查看当前类目商品"),
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
        const categoryLabel = {
            industry_news: "行业新闻",
            product_knowledge: "产品知识",
            renovation_guide: "装修指南",
        }[categoryCode] ?? categoryCode;
        return {
            id,
            category: categoryLabel,
            title: pickString(item, ["title", "name", "titleText"], "建材资讯"),
            summary: pickString(item, ["summary", "subtitle", "description", "summaryText"], "查看最新建材资讯"),
            route: routes_1.ROUTES.articleDetail,
            params: {
                id,
                category: categoryCode,
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
