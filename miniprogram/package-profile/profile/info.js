"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const profile_1 = require("../../mock/profile");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
function isSameDraft(left, right) {
    return (left.avatar === right.avatar &&
        left.nickname === right.nickname &&
        left.phone === right.phone &&
        left.companyName === right.companyName &&
        left.buyerRole === right.buyerRole);
}
function buildViewState(userProfile, profileDraft) {
    return {
        userProfile,
        profileDraft,
        completionTips: (0, profile_1.getProfileCompletionTips)(profileDraft),
        isEnterpriseComplete: (0, profile_1.isEnterpriseProfileComplete)(profileDraft),
        hasUnsavedChanges: !isSameDraft(profileDraft, (0, profile_1.buildProfileDraft)(userProfile)),
    };
}
Page({
    data: {
        status: "loading",
        mockState: "",
        userProfile: null,
        profileDraft: null,
        completionTips: [],
        isEnterpriseComplete: true,
        hasUnsavedChanges: false,
        avatarOptions: profile_1.profileAvatarOptions,
        roleOptions: profile_1.buyerRoleOptions,
    },
    onLoad(options) {
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
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
                userProfile: null,
                profileDraft: null,
                completionTips: [],
                isEnterpriseComplete: true,
                hasUnsavedChanges: false,
            });
            return;
        }
        try {
            const userProfile = (0, storage_1.getUserProfile)();
            const profileDraft = (0, storage_1.getProfileDraft)();
            this.setData({
                status: "ready",
                ...buildViewState(userProfile, profileDraft),
            });
        }
        catch {
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
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.profile);
            },
        });
    },
    handleGoProfile() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.profile);
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        this.hydratePage();
    },
    updateDraft(patch) {
        const { userProfile, profileDraft } = this.data;
        if (!userProfile || !profileDraft)
            return;
        const nextDraft = (0, storage_1.saveProfileDraft)({
            ...profileDraft,
            ...patch,
        });
        this.setData(buildViewState(userProfile, nextDraft));
    },
    handleInput(event) {
        const { field } = event.currentTarget.dataset;
        if (!field)
            return;
        this.updateDraft({
            [field]: event.detail.value,
        });
    },
    handleAvatarSelect(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        this.updateDraft({
            avatar: value,
        });
    },
    handleRoleSelect(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
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
        const userProfile = (0, storage_1.getUserProfile)();
        const profileDraft = (0, storage_1.resetProfileDraft)();
        this.setData(buildViewState(userProfile, profileDraft));
        wx.showToast({
            title: "已恢复已保存资料",
            icon: "success",
        });
    },
    validateDraft() {
        const { profileDraft } = this.data;
        if (!profileDraft)
            return false;
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
        if (!userProfile || !profileDraft || !this.validateDraft())
            return;
        const nextProfile = (0, storage_1.saveUserProfile)({
            ...userProfile,
            avatar: profileDraft.avatar,
            nickname: profileDraft.nickname.trim(),
            phone: userProfile.phone,
            companyName: profileDraft.companyName.trim(),
            buyerRole: profileDraft.buyerRole.trim(),
        });
        const nextDraft = (0, storage_1.getProfileDraft)();
        this.setData(buildViewState(nextProfile, nextDraft));
        wx.showToast({
            title: "资料已保存",
            icon: "success",
        });
    },
});
