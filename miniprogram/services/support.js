"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportService = createSupportService;
const support_1 = require("../mock/support");
const support_2 = require("../api/modules/support");
const config_1 = require("../api/config");
const support_3 = require("../api/adapters/support");
function createSupportService(dependencies = {}) {
    const config = (0, config_1.getApiConfig)(dependencies.config ?? {});
    const supportApi = {
        ...(0, support_2.createSupportApi)({ config }),
        ...(dependencies.supportApi ?? {}),
    };
    return {
        api: supportApi,
        getSupportIndexShellData() {
            return {
                source: "mock",
                cards: support_1.supportCards,
                serviceTime: support_1.supportServiceTime,
            };
        },
        getFaqShellData(category = "all") {
            return {
                source: "mock",
                categories: (0, support_1.getFaqCategories)(),
                items: (0, support_1.getFaqItemsByCategory)(category),
            };
        },
        getChatShellData(params) {
            const sessionMeta = (0, support_1.createSupportSessionMeta)(params);
            return {
                source: "mock",
                sessionMeta,
                messages: (0, support_1.createWelcomeMessages)(sessionMeta),
                quickQuestions: support_1.supportQuickQuestions,
            };
        },
        buildMockReply(message, params) {
            return (0, support_1.createSupportReply)(message, (0, support_1.createSupportSessionMeta)(params));
        },
        getComplaintShellData() {
            return {
                source: "mock",
                defaultDraft: support_1.defaultComplaintDraft,
                problemTypes: support_1.supportProblemTypes,
            };
        },
        async submitConsultMessage(payload) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                };
            }
            try {
                await supportApi.postConsultMessage(payload);
                return {
                    source: "remote",
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                    };
                }
                throw error;
            }
        },
        async uploadEvidence(payload) {
            return (0, support_3.adaptUploadResult)(await supportApi.uploadFile(payload));
        },
    };
}
