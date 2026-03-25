import { ROUTES } from "../../constants/routes";
import { getArticleCategoryLabel, getArticleTabs, getArticlesByCategory } from "../../mock/content";
import type { ArticleFeedItem, ArticleTab } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type ArticleCardView = ArticleFeedItem & {
  categoryLabel: string;
};

function normalizeCategory(category?: string) {
  const tabs = getArticleTabs();
  return tabs.some((item) => item.value === category) ? category ?? "all" : "all";
}

function withCategoryLabel(article: ArticleFeedItem): ArticleCardView {
  return {
    ...article,
    categoryLabel: getArticleCategoryLabel(article.category),
  };
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    currentCategory: "all",
    currentTabDesc: "",
    pageSubtitle: "",
    tabs: [] as ArticleTab[],
    featuredArticle: null as ArticleCardView | null,
    articles: [] as ArticleCardView[],
    hasMore: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const currentCategory = normalizeCategory(options.category);
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      currentCategory,
      mockState: mockState ?? "",
    });

    this.hydrateArticles(currentCategory, mockState);
  },
  onPullDownRefresh() {
    this.hydrateArticles(this.data.currentCategory);
  },
  hydrateArticles(category?: string, override: PageStatus | null = null) {
    const currentCategory = normalizeCategory(category ?? this.data.currentCategory);
    const tabs = getArticleTabs();
    const currentTab = tabs.find((item) => item.value === currentCategory) ?? tabs[0];

    if (override === "loading") {
      this.setData({
        status: "loading",
        currentCategory,
        tabs,
        currentTabDesc: currentTab.desc,
        pageSubtitle: `${currentTab.label} · 加载中`,
      });
      wx.stopPullDownRefresh();
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        currentCategory,
        tabs,
        currentTabDesc: currentTab.desc,
        pageSubtitle: `${currentTab.label} · 资讯状态异常`,
        featuredArticle: null,
        articles: [],
        hasMore: false,
      });
      wx.stopPullDownRefresh();
      return;
    }

    try {
      const nextArticles = getArticlesByCategory(currentCategory).map((item) => withCategoryLabel(item));
      const featuredArticle = nextArticles[0] ?? null;

      this.setData({
        status: nextArticles.length ? "ready" : "empty",
        currentCategory,
        tabs,
        currentTabDesc: currentTab.desc,
        pageSubtitle: `${currentTab.label} · ${nextArticles.length} 篇内容`,
        featuredArticle,
        articles: featuredArticle ? nextArticles.slice(1) : [],
        hasMore: nextArticles.length > 2,
      });
    } catch {
      this.setData({
        status: "error",
        currentCategory,
        tabs,
        currentTabDesc: currentTab.desc,
        pageSubtitle: `${currentTab.label} · 加载失败`,
        featuredArticle: null,
        articles: [],
        hasMore: false,
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.home);
      },
    });
  },
  handleTabTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value || value === this.data.currentCategory) return;

    this.setData({
      currentCategory: value,
      mockState: "",
      status: "loading",
    });

    this.hydrateArticles(value);
  },
  handleOpenArticle(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.articleDetail, {
      id,
      category: this.data.currentCategory,
    });
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    this.hydrateArticles(this.data.currentCategory);
  },
  handleViewAll() {
    this.setData({
      currentCategory: "all",
      mockState: "",
      status: "loading",
    });
    this.hydrateArticles("all");
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
