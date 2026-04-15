"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileService = createProfileService;
const profile_1 = require("../mock/profile");
const profile_2 = require("../api/modules/profile");
const config_1 = require("../api/config");
const profile_3 = require("../api/adapters/profile");
const storage_1 = require("../utils/storage");
const trade_1 = require("../utils/trade");
function createProfileService(dependencies = {}) {
    const config = (0, config_1.getApiConfig)(dependencies.config ?? {});
    const profileApi = {
        ...(0, profile_2.createProfileApi)({ config }),
        ...(dependencies.profileApi ?? {}),
    };
    return {
        api: profileApi,
        getProfileHomeShellData() {
            const userProfile = (0, storage_1.getUserProfile)();
            const addresses = (0, storage_1.getAddresses)();
            const defaultAddress = addresses.find((item) => item.id === userProfile.defaultAddressId) ?? addresses[0] ?? null;
            return {
                source: "mock",
                pageData: (0, profile_1.getProfilePageData)({
                    orders: (0, storage_1.getOrders)(),
                    favoriteCount: (0, storage_1.getFavoriteIds)().length,
                    addressCount: addresses.length,
                    invoiceCount: (0, storage_1.getInvoiceRecords)().length,
                    defaultAddressText: defaultAddress ? (0, trade_1.formatAddressText)(defaultAddress) : "暂无地址",
                    userProfile,
                }),
            };
        },
        async getProfileInfoShellData() {
            const userProfile = (0, storage_1.getUserProfile)();
            try {
                if (config.mode === "remote") {
                    return {
                        source: "remote",
                        userProfile: (0, profile_3.adaptUserProfile)(await profileApi.getUserInfo()),
                        avatarOptions: profile_1.profileAvatarOptions,
                        buyerRoleOptions: profile_1.buyerRoleOptions,
                    };
                }
            }
            catch {
                // Keep mock shell available until page-level remote migration starts.
            }
            return {
                source: "mock",
                userProfile,
                draft: (0, profile_1.buildProfileDraft)(userProfile),
                completionTips: (0, profile_1.getProfileCompletionTips)((0, profile_1.buildProfileDraft)(userProfile)),
                avatarOptions: profile_1.profileAvatarOptions,
                buyerRoleOptions: profile_1.buyerRoleOptions,
            };
        },
    };
}
