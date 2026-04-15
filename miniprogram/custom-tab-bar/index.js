"use strict";
Component({
    data: {
        selected: 0,
        tabs: [
            { pagePath: "pages/home/index", text: "首页" },
            { pagePath: "pages/category/index", text: "选型" },
            { pagePath: "pages/cart/index", text: "购物车" },
            { pagePath: "pages/profile/index", text: "我的" },
        ],
    },
    methods: {
        updateSelected() {
            const pages = getCurrentPages();
            const current = pages[pages.length - 1];
            const route = current?.route ?? "";
            const selected = this.data.tabs.findIndex((tab) => tab.pagePath === route);
            this.setData({ selected: selected < 0 ? 0 : selected });
        },
        switchTab(event) {
            const { path } = event.currentTarget.dataset;
            if (!path)
                return;
            wx.switchTab({ url: `/${path}` });
        },
    },
    lifetimes: {
        attached() {
            this.updateSelected();
        },
    },
    pageLifetimes: {
        show() {
            this.updateSelected();
        },
    },
});
