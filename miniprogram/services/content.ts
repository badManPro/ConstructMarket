import { getArticleById, getArticleTabs, getArticlesByCategory, getRelatedArticles } from "../mock/content";
import { createContentApi, type ContentApi } from "../api/modules/content";
import { getApiConfig, type ApiConfig } from "../api/config";
import { adaptArticleFeedItems, buildArticleTabsFromFeed } from "../api/adapters/content";

type ContentServiceDependencies = {
  config?: Partial<ApiConfig>;
  contentApi?: Partial<ContentApi>;
};

export function createContentService(dependencies: ContentServiceDependencies = {}) {
  const config = getApiConfig(dependencies.config ?? {});
  const contentApi = {
    ...createContentApi({ config }),
    ...(dependencies.contentApi ?? {}),
  };

  return {
    api: contentApi,
    async getArticleListShellData(category = "all") {
      if (config.mode === "remote" || config.mode === "hybrid") {
        try {
          const feed = adaptArticleFeedItems(
            await contentApi.getNewsPage({
              category: category === "all" ? undefined : category,
            }),
          );

          return {
            source: "remote" as const,
            tabs: buildArticleTabsFromFeed(feed),
            articles: category === "all" ? feed : feed.filter((item) => item.category === category),
          };
        } catch {
          // Keep mock fallback until list page is migrated.
        }
      }

      return {
        source: "mock" as const,
        tabs: getArticleTabs(),
        articles: getArticlesByCategory(category),
      };
    },
    getArticleDetailShellData(articleId: string) {
      return {
        source: "mock" as const,
        article: getArticleById(articleId),
        relatedArticles: getRelatedArticles(articleId),
      };
    },
  };
}
