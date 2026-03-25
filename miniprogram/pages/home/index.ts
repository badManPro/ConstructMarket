import { ROUTES } from "../../constants/routes";
import { articleEntrances, getHomeSections, homeBanners, homeCategoryNav, hotSearchKeywords } from "../../mock/browse";
import type { SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getFavoriteIds, toggleFavoriteId } from "../../utils/storage";

Page({
  data: {
    title: "建材采购首页",
    summary: "围绕工程采购场景组织主材、辅材和资讯导流，优先打通浏览到商品详情的前半链路。",
    searchKeyword: "42.5R 水泥",
    keywordSuggestions: hotSearchKeywords,
    banners: homeBanners,
    categoryNav: homeCategoryNav,
    campaignProducts: [] as SearchProduct[],
    hotProducts: [] as SearchProduct[],
    articleEntrances,
  },
  onLoad() {
    this.hydrateHomeSections();
  },
  onShow() {
    this.hydrateHomeSections();
  },
  hydrateHomeSections() {
    const favoriteIds = getFavoriteIds();
    const sections = getHomeSections(favoriteIds);
    this.setData(sections);
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
    this.setData(getHomeSections(favoriteIds));
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
});
