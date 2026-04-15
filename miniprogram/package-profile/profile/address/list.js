"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../../constants/routes");
const navigate_1 = require("../../../utils/navigate");
const storage_1 = require("../../../utils/storage");
Page({
    data: {
        scene: "profile",
        addresses: [],
        selectedAddressId: "",
    },
    onLoad(options) {
        this.setData({
            scene: options.scene === "checkout" ? "checkout" : "profile",
        });
    },
    onShow() {
        this.hydrateAddresses();
    },
    hydrateAddresses() {
        const draft = (0, storage_1.getCheckoutDraft)();
        this.setData({
            addresses: (0, storage_1.getAddresses)(),
            selectedAddressId: draft.selectedAddressId ?? "",
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(this.data.scene === "checkout" ? routes_1.ROUTES.checkout : routes_1.ROUTES.profile);
            },
        });
    },
    handleAddressTap(event) {
        if (this.data.scene !== "checkout")
            return;
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, storage_1.patchCheckoutDraft)({ selectedAddressId: id });
        wx.showToast({
            title: "已选择收货地址",
            icon: "success",
        });
        this.handleGoBack();
    },
    handleSetDefault(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, storage_1.setDefaultAddress)(id);
        this.hydrateAddresses();
        wx.showToast({
            title: "默认地址已更新",
            icon: "success",
        });
    },
    handleEdit(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.addressEdit, {
            id,
            scene: this.data.scene,
        });
    },
    handleAdd() {
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.addressEdit, {
            scene: this.data.scene,
        });
    },
    handleDelete(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        wx.showModal({
            title: "删除地址",
            content: "删除后不可恢复，是否继续？",
            success: ({ confirm }) => {
                if (!confirm)
                    return;
                (0, storage_1.deleteAddress)(id);
                this.hydrateAddresses();
                wx.showToast({
                    title: "地址已删除",
                    icon: "success",
                });
            },
        });
    },
});
