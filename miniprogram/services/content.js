"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContentService = createContentService;
const content_1 = require("../mock/content");
const content_2 = require("../api/modules/content");
const config_1 = require("../api/config");
const content_3 = require("../api/adapters/content");
function createContentService(dependencies = {}) {
    const config = (0, config_1.getApiConfig)(dependencies.config ?? {});
    const contentApi = {
        ...(0, content_2.createContentApi)({ config }),
        ...(dependencies.contentApi ?? {}),
    };
    return {
        api: contentApi,
        async getArticleListShellData(category = "all") {
            if (config.mode === "remote" || config.mode === "hybrid") {
                try {
                    const feed = (0, content_3.adaptArticleFeedItems)(await contentApi.getNewsPage({
                        category: category === "all" ? undefined : category,
                    }));
                    return {
                        source: "remote",
                        tabs: (0, content_3.buildArticleTabsFromFeed)(feed),
                        articles: category === "all" ? feed : feed.filter((item) => item.category === category),
                    };
                }
                catch {
                    // Keep mock fallback until list page is migrated.
                }
            }
            return {
                source: "mock",
                tabs: (0, content_1.getArticleTabs)(),
                articles: (0, content_1.getArticlesByCategory)(category),
            };
        },
        getArticleDetailShellData(articleId) {
            return {
                source: "mock",
                article: (0, content_1.getArticleById)(articleId),
                relatedArticles: (0, content_1.getRelatedArticles)(articleId),
            };
        },
    };
}
