"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../../constants/routes");
const trade_1 = require("../../../mock/trade");
const navigate_1 = require("../../../utils/navigate");
const storage_1 = require("../../../utils/storage");
Page({
    data: {
        scene: "profile",
        mode: "create",
        addressId: "",
        receiver: "",
        phone: "",
        detail: "",
        tag: "项目部",
        isDefault: false,
        regionIndex: 0,
        regionOptions: trade_1.tradeRegionOptions,
        regionLabels: trade_1.tradeRegionOptions.map((item) => item.label),
    },
    onLoad(options) {
        const addressId = options.id ?? "";
        const address = (0, storage_1.getAddressById)(addressId);
        if (!address) {
            this.setData({
                scene: options.scene === "checkout" ? "checkout" : "profile",
            });
            return;
        }
        const regionIndex = trade_1.tradeRegionOptions.findIndex((item) => item.province === address.province && item.city === address.city && item.district === address.district);
        this.setData({
            scene: options.scene === "checkout" ? "checkout" : "profile",
            mode: "edit",
            addressId,
            receiver: address.receiver,
            phone: address.phone,
            detail: address.detail,
            tag: address.tag,
            isDefault: address.isDefault,
            regionIndex: regionIndex >= 0 ? regionIndex : 0,
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateWithParams)(routes_1.ROUTES.addressList, {
                    scene: this.data.scene,
                });
            },
        });
    },
    handleInput(event) {
        const { field } = event.currentTarget.dataset;
        if (!field)
            return;
        this.setData({
            [field]: event.detail.value,
        });
    },
    handleRegionChange(event) {
        const { value } = event.detail;
        this.setData({
            regionIndex: Number(value),
        });
    },
    handleDefaultChange(event) {
        const { value } = event.detail;
        this.setData({
            isDefault: value,
        });
    },
    validateForm() {
        if (!this.data.receiver.trim()) {
            wx.showToast({ title: "请填写收货人", icon: "none" });
            return false;
        }
        if (!/^1\d{10}$/.test(this.data.phone.trim())) {
            wx.showToast({ title: "请填写正确手机号", icon: "none" });
            return false;
        }
        if (!this.data.detail.trim()) {
            wx.showToast({ title: "请填写详细地址", icon: "none" });
            return false;
        }
        return true;
    },
    handleSave() {
        if (!this.validateForm())
            return;
        const region = this.data.regionOptions[this.data.regionIndex];
        const nextAddress = {
            id: this.data.addressId || `addr-${Date.now()}`,
            receiver: this.data.receiver.trim(),
            phone: this.data.phone.trim(),
            province: region.province,
            city: region.city,
            district: region.district,
            detail: this.data.detail.trim(),
            tag: this.data.tag.trim() || "项目部",
            isDefault: this.data.isDefault,
        };
        const savedAddress = (0, storage_1.upsertAddress)(nextAddress);
        if (this.data.scene === "checkout" && savedAddress) {
            (0, storage_1.patchCheckoutDraft)({
                selectedAddressId: savedAddress.id,
            });
        }
        wx.showToast({
            title: "地址已保存",
            icon: "success",
        });
        this.handleGoBack();
    },
});
