import { ROUTES } from "../../constants/routes";
import { createBrowseService } from "../../services/browse";
import type { ArticleEntrance, BannerCard, CategoryShortcut, SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getFavoriteIds, toggleFavoriteId } from "../../utils/storage";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type HomeCategoryItem = CategoryShortcut & {
  shortName: string;
};

function withShortName(items: CategoryShortcut[]): HomeCategoryItem[] {
  return items.map((item) => ({
    ...item,
    shortName: item.name.slice(0, 2),
  }));
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    title: "建材采购首页",
    summary: "围绕工程采购场景组织主材、辅材和资讯导流，优先打通浏览到商品详情的前半链路。",
    cityLabel: "杭州",
    messageBadge: "消息 99+",
    searchKeyword: "42.5R 水泥",
    keywordSuggestions: [] as string[],
    banners: [] as BannerCard[],
    categoryNav: [] as HomeCategoryItem[],
    campaignProducts: [] as SearchProduct[],
    hotProducts: [] as SearchProduct[],
    articleEntrances: [] as ArticleEntrance[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      mockState: mockState ?? "",
    });

    void this.hydrateHomeSections(mockState);
  },
  onShow() {
    if (this.data.mockState) return;
    void this.hydrateHomeSections();
  },
  async hydrateHomeSections(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        keywordSuggestions: [],
        banners: [],
        categoryNav: [],
        campaignProducts: [],
        hotProducts: [],
        articleEntrances: [],
      });
      return;
    }

    try {
      const homeData = await createBrowseService().getHomePageData(getFavoriteIds());
      const hasContent =
        homeData.banners.length ||
        homeData.categoryNav.length ||
        homeData.campaignProducts.length ||
        homeData.hotProducts.length ||
        homeData.articleEntrances.length;

      this.setData({
        status: hasContent ? "ready" : "empty",
        keywordSuggestions: homeData.keywordSuggestions,
        banners: homeData.banners,
        categoryNav: withShortName(homeData.categoryNav),
        campaignProducts: homeData.campaignProducts,
        hotProducts: homeData.hotProducts,
        articleEntrances: homeData.articleEntrances,
      });
    } catch {
      this.setData({
        status: "error",
        keywordSuggestions: [],
        banners: [],
        categoryNav: [],
        campaignProducts: [],
        hotProducts: [],
        articleEntrances: [],
      });
    }
  },
  handleSearchTap() {
    navigateWithParams(ROUTES.searchResult, { keyword: this.data.searchKeyword });
  },
  handleKeywordTap(event: WechatMiniprogram.Event) {
    const { keyword } = event.currentTarget.dataset as { keyword?: string };
    if (!keyword) return;
    this.setData({ searchKeyword: keyword });
    navigateWithParams(ROUTES.searchResult, { keyword });
  },
  handleBannerTap(event: WechatMiniprogram.Event) {
    const { route, params } = event.currentTarget.dataset as {
      route?: string;
      params?: Record<string, string>;
    };
    if (!route) return;
    navigateWithParams(route, params ?? {});
  },
  handleCategoryTap(event: WechatMiniprogram.Event) {
    const { route, params } = event.currentTarget.dataset as {
      route?: string;
      params?: Record<string, string>;
    };
    if (!route) return;
    navigateWithParams(route, params ?? {});
  },
  handleProductTap(
    event: WechatMiniprogram.Event & {
      detail?: { id?: string };
    },
  ) {
    const { id } = event.detail ?? {};
    if (!id) return;
    navigateWithParams(ROUTES.productDetail, { id });
  },
  handleFavoriteTap(
    event: WechatMiniprogram.Event & {
      detail?: { id?: string };
    },
  ) {
    const { id } = event.detail ?? {};
    if (!id) return;
    const favoriteIds = toggleFavoriteId(id);
    void this.hydrateHomeSections();
    wx.showToast({
      title: favoriteIds.includes(id) ? "已加入收藏" : "已取消收藏",
      icon: "none",
    });
  },
  handleArticleTap(event: WechatMiniprogram.Event) {
    const { route, params } = event.currentTarget.dataset as {
      route?: string;
      params?: Record<string, string>;
    };
    if (!route) return;
    navigateWithParams(route, params ?? {});
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    void this.hydrateHomeSections();
  },
});
