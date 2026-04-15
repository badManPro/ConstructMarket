"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const support_1 = require("../../mock/support");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
Page({
    data: {
        status: "loading",
        cards: [],
        serviceTime: support_1.supportServiceTime,
        serviceNote: "商品详情页和订单详情页都可以直接带上下文进入在线咨询。",
    },
    onLoad(options) {
        this.hydratePage((0, page_1.getPageStatusOverride)(options.state));
    },
    hydratePage(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                cards: support_1.supportCards,
            });
            return;
        }
        this.setData({
            status: "ready",
            cards: support_1.supportCards,
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.profile);
            },
        });
    },
    handleRouteTap(event) {
        const { route } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateToRoute)(route);
    },
    handleGoFaq() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportFaq);
    },
    handleGoComplaint() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportComplaint);
    },
    handleRetry() {
        this.setData({
            status: "loading",
        });
        this.hydratePage();
    },
});
