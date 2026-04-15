import {
  buildProfileDraft,
  buyerRoleOptions,
  getProfileCompletionTips,
  getProfilePageData,
  profileAvatarOptions,
} from "../mock/profile";
import { createProfileApi, type ProfileApi } from "../api/modules/profile";
import { getApiConfig, type ApiConfig } from "../api/config";
import { adaptUserProfile } from "../api/adapters/profile";
import { getAddresses, getFavoriteIds, getInvoiceRecords, getOrders, getUserProfile } from "../utils/storage";
import { formatAddressText } from "../utils/trade";

type ProfileServiceDependencies = {
  config?: Partial<ApiConfig>;
  profileApi?: Partial<ProfileApi>;
};

export function createProfileService(dependencies: ProfileServiceDependencies = {}) {
  const config = getApiConfig(dependencies.config ?? {});
  const profileApi = {
    ...createProfileApi({ config }),
    ...(dependencies.profileApi ?? {}),
  };

  return {
    api: profileApi,
    getProfileHomeShellData() {
      const userProfile = getUserProfile();
      const addresses = getAddresses();
      const defaultAddress = addresses.find((item) => item.id === userProfile.defaultAddressId) ?? addresses[0] ?? null;

      return {
        source: "mock" as const,
        pageData: getProfilePageData({
          orders: getOrders(),
          favoriteCount: getFavoriteIds().length,
          addressCount: addresses.length,
          invoiceCount: getInvoiceRecords().length,
          defaultAddressText: defaultAddress ? formatAddressText(defaultAddress) : "暂无地址",
          userProfile,
        }),
      };
    },
    async getProfileInfoShellData() {
      const userProfile = getUserProfile();

      try {
        if (config.mode === "remote") {
          return {
            source: "remote" as const,
            userProfile: adaptUserProfile(await profileApi.getUserInfo()),
            avatarOptions: profileAvatarOptions,
            buyerRoleOptions,
          };
        }
      } catch {
        // Keep mock shell available until page-level remote migration starts.
      }

      return {
        source: "mock" as const,
        userProfile,
        draft: buildProfileDraft(userProfile),
        completionTips: getProfileCompletionTips(buildProfileDraft(userProfile)),
        avatarOptions: profileAvatarOptions,
        buyerRoleOptions,
      };
    },
  };
}
