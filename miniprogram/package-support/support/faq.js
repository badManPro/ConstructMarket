"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const support_1 = require("../../mock/support");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
function normalizeCategory(category) {
    const categories = (0, support_1.getFaqCategories)();
    return categories.some((item) => item.value === category) ? category ?? "all" : "all";
}
Page({
    data: {
        status: "loading",
        currentCategory: "all",
        categories: [],
        faqs: [],
    },
    onLoad(options) {
        const currentCategory = normalizeCategory(options.category);
        this.setData({
            currentCategory,
        });
        this.hydrateFaqs(currentCategory, (0, page_1.getPageStatusOverride)(options.state));
    },
    hydrateFaqs(category, override = null) {
        const currentCategory = normalizeCategory(category ?? this.data.currentCategory);
        const categories = (0, support_1.getFaqCategories)();
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
            const faqs = (0, support_1.getFaqItemsByCategory)(currentCategory).map((item) => ({
                ...item,
                expanded: false,
            }));
            this.setData({
                status: faqs.length ? "ready" : "empty",
                currentCategory,
                categories,
                faqs,
            });
        }
        catch {
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
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportIndex);
            },
        });
    },
    handleCategoryTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value || value === this.data.currentCategory)
            return;
        this.setData({
            currentCategory: value,
            status: "loading",
        });
        this.hydrateFaqs(value);
    },
    handleToggle(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        this.setData({
            faqs: this.data.faqs.map((item) => item.id === id
                ? {
                    ...item,
                    expanded: !item.expanded,
                }
                : item),
        });
    },
    handleGoChat() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportChat);
    },
    handleRetry() {
        this.setData({
            status: "loading",
        });
        this.hydrateFaqs(this.data.currentCategory);
    },
});
