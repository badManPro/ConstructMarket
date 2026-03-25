import { ROUTES } from "../../constants/routes";
import { defaultInvoiceDraft } from "../../mock/trade";
import type { InvoiceDraft, InvoiceRecord, Order } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { formatAddressText } from "../../utils/trade";
import { getCheckoutDraft, getInvoiceRecords, getOrders, patchCheckoutDraft, prependInvoiceRecord } from "../../utils/storage";

type InvoiceTab = "electronic" | "paper" | "manage";
type InvoiceRecordView = InvoiceRecord & {
  statusText: string;
  typeText: string;
};
type InvoiceCandidateView = Order & {
  addressText: string;
};

const INVOICE_STATUS_TEXT_MAP: Record<string, string> = {
  can_apply: "待申请",
  applying: "申请中",
  issued: "已开具",
  rejected: "已驳回",
};

Page({
  data: {
    scene: "profile",
    activeTab: "electronic" as InvoiceTab,
    formDraft: defaultInvoiceDraft as InvoiceDraft,
    invoiceRecords: [] as InvoiceRecordView[],
    invoiceCandidates: [] as InvoiceCandidateView[],
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      scene: options.scene === "checkout" ? "checkout" : "profile",
    });
  },
  onShow() {
    this.hydrateInvoiceCenter();
  },
  hydrateInvoiceCenter() {
    const draft = getCheckoutDraft().invoiceDraft ?? defaultInvoiceDraft;
    const activeTab = this.data.activeTab === "manage" ? "manage" : draft.type;

    this.setData({
      activeTab,
      formDraft: {
        ...defaultInvoiceDraft,
        ...draft,
      },
      invoiceRecords: getInvoiceRecords().map((item) => ({
        ...item,
        statusText: INVOICE_STATUS_TEXT_MAP[item.status] ?? "处理中",
        typeText: item.type === "paper" ? "纸质发票" : "电子发票",
      })),
      invoiceCandidates: getOrders()
        .filter((item) => item.payStatus === "success")
        .map((item) => ({
          ...item,
          addressText: formatAddressText(item.address),
        })),
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(this.data.scene === "checkout" ? ROUTES.checkout : ROUTES.profile);
      },
    });
  },
  handleTabTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: InvoiceTab };
    if (!value) return;

    if (value === "manage") {
      this.setData({ activeTab: value });
      return;
    }

    this.setData({
      activeTab: value,
      formDraft: {
        ...this.data.formDraft,
        type: value,
      },
    });
  },
  handleInput(event: WechatMiniprogram.InputEvent) {
    const { field } = event.currentTarget.dataset as { field?: keyof InvoiceDraft };
    if (!field) return;

    this.setData({
      formDraft: {
        ...this.data.formDraft,
        [field]: event.detail.value,
      },
    });
  },
  validateForm() {
    const draft = this.data.formDraft;

    if (!draft.title.trim()) {
      wx.showToast({ title: "请填写发票抬头", icon: "none" });
      return false;
    }

    if (!draft.taxNo.trim()) {
      wx.showToast({ title: "请填写税号", icon: "none" });
      return false;
    }

    if (!/.+@.+/.test(draft.email.trim())) {
      wx.showToast({ title: "请填写正确邮箱", icon: "none" });
      return false;
    }

    return true;
  },
  handleSaveInvoice() {
    if (!this.validateForm()) return;

    const nextDraft: InvoiceDraft = {
      ...this.data.formDraft,
      type: this.data.activeTab === "paper" ? "paper" : "electronic",
      title: this.data.formDraft.title.trim(),
      taxNo: this.data.formDraft.taxNo.trim(),
      email: this.data.formDraft.email.trim(),
    };

    if (this.data.scene === "checkout") {
      patchCheckoutDraft({
        invoiceDraft: nextDraft,
      });
      wx.showToast({
        title: "发票信息已回流",
        icon: "success",
      });
      this.handleGoBack();
      return;
    }

    const candidate = this.data.invoiceCandidates[0];
    if (!candidate) {
      wx.showToast({
        title: "暂无可开票订单",
        icon: "none",
      });
      return;
    }

    const now = new Date();
    const applyAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    prependInvoiceRecord({
      id: `invoice-record-${Date.now()}`,
      orderNo: candidate.orderNo,
      type: nextDraft.type,
      status: "applying",
      title: nextDraft.title,
      taxNo: nextDraft.taxNo,
      email: nextDraft.email,
      receiverName: candidate.address.receiver,
      receiverPhone: candidate.address.phone,
      receiverAddress: candidate.addressText,
      applyAt,
    });

    wx.showToast({
      title: "已提交开票申请",
      icon: "success",
    });

    this.setData({
      activeTab: "manage",
      formDraft: nextDraft,
    });
    this.hydrateInvoiceCenter();
  },
  handleOpenOrder(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.orderDetail, {
      id,
    });
  },
});
