"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptArticleFeedItems = adaptArticleFeedItems;
exports.buildArticleTabsFromFeed = buildArticleTabsFromFeed;
const enums_1 = require("../../types/enums");
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
function adaptArticleFeedItems(input) {
    return extractArray(input).map((item, index) => ({
        id: pickString(item, ["id", "articleId", "newsId"], `article-${index + 1}`),
        category: pickString(item, ["category", "categoryCode"], enums_1.ARTICLE_CATEGORY[0]),
        title: pickString(item, ["title", "name"], "建材资讯"),
        cover: pickString(item, ["cover", "coverUrl", "imageUrl"], "建材资讯"),
        summary: pickString(item, ["summary", "subtitle", "description"], "真实接口资讯摘要"),
        source: pickString(item, ["source", "author"], "ConstructMarket"),
        publishAt: pickString(item, ["publishAt", "publishedAt", "createTime"], ""),
        content: pickString(item, ["content"], ""),
        relatedIds: [],
        tone: "linear-gradient(135deg, #fff1ea, #ffe4d6)",
        readingTime: pickString(item, ["readingTime"], "3 分钟阅读"),
        tags: [],
    }));
}
function buildArticleTabsFromFeed(feed) {
    return [
        {
            value: "all",
            label: "全部",
            count: feed.length,
            desc: "按时间查看全部资讯内容。",
        },
        ...enums_1.ARTICLE_CATEGORY.map((category) => ({
            value: category,
            label: category === "industry_news" ? "行业新闻" : category === "product_knowledge" ? "产品知识" : "装修指南",
            count: feed.filter((item) => item.category === category).length,
            desc: "真实接口资讯分类。",
        })),
    ];
}
