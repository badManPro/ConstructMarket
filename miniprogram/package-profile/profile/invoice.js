"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const trade_1 = require("../../mock/trade");
const navigate_1 = require("../../utils/navigate");
const trade_2 = require("../../utils/trade");
const storage_1 = require("../../utils/storage");
const INVOICE_STATUS_TEXT_MAP = {
    can_apply: "待申请",
    applying: "申请中",
    issued: "已开具",
    rejected: "已驳回",
};
Page({
    data: {
        scene: "profile",
        activeTab: "electronic",
        formDraft: trade_1.defaultInvoiceDraft,
        invoiceRecords: [],
        invoiceCandidates: [],
    },
    onLoad(options) {
        this.setData({
            scene: options.scene === "checkout" ? "checkout" : "profile",
        });
    },
    onShow() {
        this.hydrateInvoiceCenter();
    },
    hydrateInvoiceCenter() {
        const draft = (0, storage_1.getCheckoutDraft)().invoiceDraft ?? trade_1.defaultInvoiceDraft;
        const activeTab = this.data.activeTab === "manage" ? "manage" : draft.type;
        this.setData({
            activeTab,
            formDraft: {
                ...trade_1.defaultInvoiceDraft,
                ...draft,
            },
            invoiceRecords: (0, storage_1.getInvoiceRecords)().map((item) => ({
                ...item,
                statusText: INVOICE_STATUS_TEXT_MAP[item.status] ?? "处理中",
                typeText: item.type === "paper" ? "纸质发票" : "电子发票",
            })),
            invoiceCandidates: (0, storage_1.getOrders)()
                .filter((item) => item.payStatus === "success")
                .map((item) => ({
                ...item,
                addressText: (0, trade_2.formatAddressText)(item.address),
            })),
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(this.data.scene === "checkout" ? routes_1.ROUTES.checkout : routes_1.ROUTES.profile);
            },
        });
    },
    handleTabTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
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
    handleInput(event) {
        const { field } = event.currentTarget.dataset;
        if (!field)
            return;
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
        if (!this.validateForm())
            return;
        const nextDraft = {
            ...this.data.formDraft,
            type: this.data.activeTab === "paper" ? "paper" : "electronic",
            title: this.data.formDraft.title.trim(),
            taxNo: this.data.formDraft.taxNo.trim(),
            email: this.data.formDraft.email.trim(),
        };
        if (this.data.scene === "checkout") {
            (0, storage_1.patchCheckoutDraft)({
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
        (0, storage_1.prependInvoiceRecord)({
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
    handleOpenOrder(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.orderDetail, {
            id,
        });
    },
});
