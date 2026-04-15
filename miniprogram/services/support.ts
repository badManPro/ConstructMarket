import {
  createSupportReply,
  createSupportSessionMeta,
  createWelcomeMessages,
  defaultComplaintDraft,
  getFaqCategories,
  getFaqItemsByCategory,
  supportCards,
  supportProblemTypes,
  supportQuickQuestions,
  supportServiceTime,
} from "../mock/support";
import { createSupportApi, type SupportApi } from "../api/modules/support";
import { getApiConfig, type ApiConfig } from "../api/config";
import { adaptUploadResult } from "../api/adapters/support";

type SupportServiceDependencies = {
  config?: Partial<ApiConfig>;
  supportApi?: Partial<SupportApi>;
};

export function createSupportService(dependencies: SupportServiceDependencies = {}) {
  const config = getApiConfig(dependencies.config ?? {});
  const supportApi = {
    ...createSupportApi({ config }),
    ...(dependencies.supportApi ?? {}),
  };

  return {
    api: supportApi,
    getSupportIndexShellData() {
      return {
        source: "mock" as const,
        cards: supportCards,
        serviceTime: supportServiceTime,
      };
    },
    getFaqShellData(category = "all") {
      return {
        source: "mock" as const,
        categories: getFaqCategories(),
        items: getFaqItemsByCategory(category),
      };
    },
    getChatShellData(params: { source?: string; productName?: string; orderNo?: string }) {
      const sessionMeta = createSupportSessionMeta(params);

      return {
        source: "mock" as const,
        sessionMeta,
        messages: createWelcomeMessages(sessionMeta),
        quickQuestions: supportQuickQuestions,
      };
    },
    buildMockReply(message: string, params: { source?: string; productName?: string; orderNo?: string }) {
      return createSupportReply(message, createSupportSessionMeta(params));
    },
    getComplaintShellData() {
      return {
        source: "mock" as const,
        defaultDraft: defaultComplaintDraft,
        problemTypes: supportProblemTypes,
      };
    },
    async submitConsultMessage(payload: Record<string, unknown>) {
      return supportApi.postConsultMessage(payload);
    },
    async uploadEvidence(payload: Record<string, unknown>) {
      return adaptUploadResult(await supportApi.uploadFile(payload));
    },
  };
}
