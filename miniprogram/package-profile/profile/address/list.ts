import { ROUTES } from "../../../constants/routes";
import type { Address } from "../../../types/models";
import { navigateToRoute, navigateWithParams } from "../../../utils/navigate";
import { deleteAddress, getAddresses, getCheckoutDraft, patchCheckoutDraft, setDefaultAddress } from "../../../utils/storage";

Page({
  data: {
    scene: "profile",
    addresses: [] as Address[],
    selectedAddressId: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      scene: options.scene === "checkout" ? "checkout" : "profile",
    });
  },
  onShow() {
    this.hydrateAddresses();
  },
  hydrateAddresses() {
    const draft = getCheckoutDraft();
    this.setData({
      addresses: getAddresses(),
      selectedAddressId: draft.selectedAddressId ?? "",
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(this.data.scene === "checkout" ? ROUTES.checkout : ROUTES.profile);
      },
    });
  },
  handleAddressTap(event: WechatMiniprogram.Event) {
    if (this.data.scene !== "checkout") return;

    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    patchCheckoutDraft({ selectedAddressId: id });
    wx.showToast({
      title: "已选择收货地址",
      icon: "success",
    });
    this.handleGoBack();
  },
  handleSetDefault(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    setDefaultAddress(id);
    this.hydrateAddresses();
    wx.showToast({
      title: "默认地址已更新",
      icon: "success",
    });
  },
  handleEdit(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.addressEdit, {
      id,
      scene: this.data.scene,
    });
  },
  handleAdd() {
    navigateWithParams(ROUTES.addressEdit, {
      scene: this.data.scene,
    });
  },
  handleDelete(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    wx.showModal({
      title: "删除地址",
      content: "删除后不可恢复，是否继续？",
      success: ({ confirm }) => {
        if (!confirm) return;

        deleteAddress(id);
        this.hydrateAddresses();
        wx.showToast({
          title: "地址已删除",
          icon: "success",
        });
      },
    });
  },
});
