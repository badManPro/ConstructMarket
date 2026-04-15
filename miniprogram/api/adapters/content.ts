import { ARTICLE_CATEGORY } from "../../types/enums";
import type { ArticleFeedItem, ArticleTab } from "../../types/models";

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
  }

  return fallback;
}

export function adaptArticleFeedItems(input: unknown): ArticleFeedItem[] {
  return extractArray(input).map((item, index) => ({
    id: pickString(item, ["id", "articleId", "newsId"], `article-${index + 1}`),
    category: pickString(item, ["category", "categoryCode"], ARTICLE_CATEGORY[0]),
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

export function buildArticleTabsFromFeed(feed: ArticleFeedItem[]): ArticleTab[] {
  return [
    {
      value: "all",
      label: "全部",
      count: feed.length,
      desc: "按时间查看全部资讯内容。",
    },
    ...ARTICLE_CATEGORY.map((category) => ({
      value: category,
      label: category === "industry_news" ? "行业新闻" : category === "product_knowledge" ? "产品知识" : "装修指南",
      count: feed.filter((item) => item.category === category).length,
      desc: "真实接口资讯分类。",
    })),
  ];
}
