import { ROUTES } from "../../constants/routes";
import { getFaqCategories, getFaqItemsByCategory } from "../../mock/support";
import type { FaqCategory, FaqItem } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type FaqView = FaqItem & {
  expanded: boolean;
};

function normalizeCategory(category?: string) {
  const categories = getFaqCategories();
  return categories.some((item) => item.value === category) ? category ?? "all" : "all";
}

Page({
  data: {
    status: "loading" as PageStatus,
    currentCategory: "all",
    categories: [] as FaqCategory[],
    faqs: [] as FaqView[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const currentCategory = normalizeCategory(options.category);
    this.setData({
      currentCategory,
    });

    this.hydrateFaqs(currentCategory, getPageStatusOverride(options.state));
  },
  hydrateFaqs(category?: string, override: PageStatus | null = null) {
    const currentCategory = normalizeCategory(category ?? this.data.currentCategory);
    const categories = getFaqCategories();

    if (override === "loading") {
      this.setData({
        status: "loading",
        currentCategory,
        categories,
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        currentCategory,
        categories,
        faqs: [],
      });
      return;
    }

    try {
      const faqs = getFaqItemsByCategory(currentCategory).map((item) => ({
        ...item,
        expanded: false,
      }));

      this.setData({
        status: faqs.length ? "ready" : "empty",
        currentCategory,
        categories,
        faqs,
      });
    } catch {
      this.setData({
        status: "error",
        currentCategory,
        categories,
        faqs: [],
      });
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.supportIndex);
      },
    });
  },
  handleCategoryTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value || value === this.data.currentCategory) return;

    this.setData({
      currentCategory: value,
      status: "loading",
    });
    this.hydrateFaqs(value);
  },
  handleToggle(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    this.setData({
      faqs: this.data.faqs.map((item) =>
        item.id === id
          ? {
              ...item,
              expanded: !item.expanded,
            }
          : item,
      ),
    });
  },
  handleGoChat() {
    navigateToRoute(ROUTES.supportChat);
  },
  handleRetry() {
    this.setData({
      status: "loading",
    });
    this.hydrateFaqs(this.data.currentCategory);
  },
});
