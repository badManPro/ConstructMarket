import { ROUTES } from "../../constants/routes";
import { getArticleById, getArticleCategoryLabel, getArticlesByCategory, getRelatedArticles } from "../../mock/content";
import type { ArticleFeedItem } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type RelatedArticleCard = ArticleFeedItem & {
  categoryLabel: string;
};

function withCategoryLabel(article: ArticleFeedItem): RelatedArticleCard {
  return {
    ...article,
    categoryLabel: getArticleCategoryLabel(article.category),
  };
}

Page({
  data: {
    status: "loading" as PageStatus,
    articleId: "",
    fallbackCategory: "all",
    article: null as RelatedArticleCard | null,
    paragraphs: [] as string[],
    relatedArticles: [] as RelatedArticleCard[],
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      articleId: options.id ?? "",
      fallbackCategory: options.category ?? "all",
    });

    this.hydrateArticle(getPageStatusOverride(options.state));
  },
  hydrateArticle(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        article: null,
        paragraphs: [],
        relatedArticles: [],
      });
      return;
    }

    try {
      const fallbackArticles = getArticlesByCategory(this.data.fallbackCategory);
      const targetArticle = getArticleById(this.data.articleId) ?? fallbackArticles[0] ?? null;

      if (!targetArticle) {
        this.setData({
          status: "empty",
          article: null,
          paragraphs: [],
          relatedArticles: [],
        });
        return;
      }

      this.setData({
        status: "ready",
        articleId: targetArticle.id,
        article: withCategoryLabel(targetArticle),
        paragraphs: targetArticle.content.split("\n\n"),
        relatedArticles: getRelatedArticles(targetArticle.id).map((item) => withCategoryLabel(item)),
      });
    } catch {
      this.setData({
        status: "error",
        article: null,
        paragraphs: [],
        relatedArticles: [],
      });
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        if (this.data.fallbackCategory && this.data.fallbackCategory !== "all") {
          navigateWithParams(ROUTES.articleList, {
            category: this.data.fallbackCategory,
          });
          return;
        }

        navigateToRoute(ROUTES.articleList);
      },
    });
  },
  handleOpenArticle(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.articleDetail, {
      id,
      category: this.data.article?.category ?? this.data.fallbackCategory,
    });
  },
  handleGoArticleList() {
    if (this.data.article?.category) {
      navigateWithParams(ROUTES.articleList, {
        category: this.data.article.category,
      });
      return;
    }

    navigateToRoute(ROUTES.articleList);
  },
  handleRetry() {
    this.setData({
      status: "loading",
    });
    this.hydrateArticle();
  },
});
