import { ROUTES } from "../../../constants/routes";
import { tradeRegionOptions } from "../../../mock/trade";
import type { Address } from "../../../types/models";
import { navigateWithParams } from "../../../utils/navigate";
import { getAddressById, patchCheckoutDraft, upsertAddress } from "../../../utils/storage";

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
    regionOptions: tradeRegionOptions,
    regionLabels: tradeRegionOptions.map((item) => item.label),
  },
  onLoad(options: Record<string, string | undefined>) {
    const addressId = options.id ?? "";
    const address = getAddressById(addressId);

    if (!address) {
      this.setData({
        scene: options.scene === "checkout" ? "checkout" : "profile",
      });
      return;
    }

    const regionIndex = tradeRegionOptions.findIndex(
      (item) => item.province === address.province && item.city === address.city && item.district === address.district,
    );

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
        navigateWithParams(ROUTES.addressList, {
          scene: this.data.scene,
        });
      },
    });
  },
  handleInput(event: WechatMiniprogram.InputEvent) {
    const { field } = event.currentTarget.dataset as { field?: string };
    if (!field) return;

    this.setData({
      [field]: event.detail.value,
    });
  },
  handleRegionChange(event: WechatMiniprogram.Event & { detail: { value: string } }) {
    const { value } = event.detail;
    this.setData({
      regionIndex: Number(value),
    });
  },
  handleDefaultChange(event: WechatMiniprogram.Event & { detail: { value: boolean } }) {
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
    if (!this.validateForm()) return;

    const region = this.data.regionOptions[this.data.regionIndex];
    const nextAddress: Address = {
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

    const savedAddress = upsertAddress(nextAddress);

    if (this.data.scene === "checkout" && savedAddress) {
      patchCheckoutDraft({
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
