import { ROUTES } from "../../constants/routes";
import {
  buildProfileDraft,
  buyerRoleOptions,
  getProfileCompletionTips,
  isEnterpriseProfileComplete,
  profileAvatarOptions,
  type ProfileChoiceOption,
} from "../../mock/profile";
import type { ProfileDraft, UserProfile } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import { getProfileDraft, getUserProfile, resetProfileDraft, saveProfileDraft, saveUserProfile } from "../../utils/storage";

function isSameDraft(left: ProfileDraft, right: ProfileDraft) {
  return (
    left.avatar === right.avatar &&
    left.nickname === right.nickname &&
    left.phone === right.phone &&
    left.companyName === right.companyName &&
    left.buyerRole === right.buyerRole
  );
}

function buildViewState(userProfile: UserProfile, profileDraft: ProfileDraft) {
  return {
    userProfile,
    profileDraft,
    completionTips: getProfileCompletionTips(profileDraft),
    isEnterpriseComplete: isEnterpriseProfileComplete(profileDraft),
    hasUnsavedChanges: !isSameDraft(profileDraft, buildProfileDraft(userProfile)),
  };
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    userProfile: null as UserProfile | null,
    profileDraft: null as ProfileDraft | null,
    completionTips: [] as string[],
    isEnterpriseComplete: true,
    hasUnsavedChanges: false,
    avatarOptions: profileAvatarOptions as ProfileChoiceOption[],
    roleOptions: buyerRoleOptions as ProfileChoiceOption[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      mockState: mockState ?? "",
    });

    this.hydratePage(mockState);
  },
  onShow() {
    if (!this.data.mockState) {
      this.hydratePage();
    }
  },
  hydratePage(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        userProfile: null,
        profileDraft: null,
        completionTips: [],
        isEnterpriseComplete: true,
        hasUnsavedChanges: false,
      });
      return;
    }

    try {
      const userProfile = getUserProfile();
      const profileDraft = getProfileDraft();

      this.setData({
        status: "ready",
        ...buildViewState(userProfile, profileDraft),
      });
    } catch {
      this.setData({
        status: "error",
        userProfile: null,
        profileDraft: null,
        completionTips: [],
        isEnterpriseComplete: true,
        hasUnsavedChanges: false,
      });
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.profile);
      },
    });
  },
  handleGoProfile() {
    navigateToRoute(ROUTES.profile);
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    this.hydratePage();
  },
  updateDraft(patch: Partial<ProfileDraft>) {
    const { userProfile, profileDraft } = this.data;

    if (!userProfile || !profileDraft) return;

    const nextDraft = saveProfileDraft({
      ...profileDraft,
      ...patch,
    });

    this.setData(buildViewState(userProfile, nextDraft));
  },
  handleInput(event: WechatMiniprogram.InputEvent) {
    const { field } = event.currentTarget.dataset as { field?: keyof ProfileDraft };
    if (!field) return;

    this.updateDraft({
      [field]: event.detail.value,
    } as Partial<ProfileDraft>);
  },
  handleAvatarSelect(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value) return;

    this.updateDraft({
      avatar: value,
    });
  },
  handleRoleSelect(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value) return;

    this.updateDraft({
      buyerRole: value,
    });
  },
  handlePhoneTip() {
    wx.showToast({
      title: "手机号修改入口待接入账号体系",
      icon: "none",
    });
  },
  handleReset() {
    if (!this.data.hasUnsavedChanges) {
      wx.showToast({
        title: "当前没有未保存草稿",
        icon: "none",
      });
      return;
    }

    const userProfile = getUserProfile();
    const profileDraft = resetProfileDraft();

    this.setData(buildViewState(userProfile, profileDraft));

    wx.showToast({
      title: "已恢复已保存资料",
      icon: "success",
    });
  },
  validateDraft() {
    const { profileDraft } = this.data;
    if (!profileDraft) return false;

    if (!profileDraft.nickname.trim()) {
      wx.showToast({
        title: "请填写昵称",
        icon: "none",
      });
      return false;
    }

    if (!/^1\d{10}$/.test(profileDraft.phone.trim())) {
      wx.showToast({
        title: "手机号格式异常",
        icon: "none",
      });
      return false;
    }

    return true;
  },
  handleSave() {
    const { userProfile, profileDraft, hasUnsavedChanges } = this.data;

    if (!hasUnsavedChanges) {
      wx.showToast({
        title: "资料没有变化",
        icon: "none",
      });
      return;
    }

    if (!userProfile || !profileDraft || !this.validateDraft()) return;

    const nextProfile = saveUserProfile({
      ...userProfile,
      avatar: profileDraft.avatar,
      nickname: profileDraft.nickname.trim(),
      phone: userProfile.phone,
      companyName: profileDraft.companyName.trim(),
      buyerRole: profileDraft.buyerRole.trim(),
    });
    const nextDraft = getProfileDraft();

    this.setData(buildViewState(nextProfile, nextDraft));

    wx.showToast({
      title: "资料已保存",
      icon: "success",
    });
  },
});
