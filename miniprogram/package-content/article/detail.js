"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const content_1 = require("../../mock/content");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
function withCategoryLabel(article) {
    return {
        ...article,
        categoryLabel: (0, content_1.getArticleCategoryLabel)(article.category),
    };
}
Page({
    data: {
        status: "loading",
        articleId: "",
        fallbackCategory: "all",
        article: null,
        paragraphs: [],
        relatedArticles: [],
    },
    onLoad(options) {
        this.setData({
            articleId: options.id ?? "",
            fallbackCategory: options.category ?? "all",
        });
        this.hydrateArticle((0, page_1.getPageStatusOverride)(options.state));
    },
    hydrateArticle(override = null) {
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
            const fallbackArticles = (0, content_1.getArticlesByCategory)(this.data.fallbackCategory);
            const targetArticle = (0, content_1.getArticleById)(this.data.articleId) ?? fallbackArticles[0] ?? null;
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
                relatedArticles: (0, content_1.getRelatedArticles)(targetArticle.id).map((item) => withCategoryLabel(item)),
            });
        }
        catch {
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
                    (0, navigate_1.navigateWithParams)(routes_1.ROUTES.articleList, {
                        category: this.data.fallbackCategory,
                    });
                    return;
                }
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.articleList);
            },
        });
    },
    handleOpenArticle(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.articleDetail, {
            id,
            category: this.data.article?.category ?? this.data.fallbackCategory,
        });
    },
    handleGoArticleList() {
        if (this.data.article?.category) {
            (0, navigate_1.navigateWithParams)(routes_1.ROUTES.articleList, {
                category: this.data.article.category,
            });
            return;
        }
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.articleList);
    },
    handleRetry() {
        this.setData({
            status: "loading",
        });
        this.hydrateArticle();
    },
});
