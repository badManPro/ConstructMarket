"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const support_1 = require("../../mock/support");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
function isPhoneValid(phone) {
    return /^1\d{10}$/.test(phone);
}
function canSubmitComplaint(form) {
    return Boolean(form.contactName.trim() && isPhoneValid(form.phone) && form.problemType && form.description.trim());
}
Page({
    data: {
        status: "loading",
        form: {
            ...support_1.defaultComplaintDraft,
        },
        relatedOrders: [],
        problemTypes: support_1.supportProblemTypes,
        canSubmit: false,
        phoneError: false,
        submitSuccess: false,
        ticketNo: "",
    },
    onLoad(options) {
        this.hydratePage((0, page_1.getPageStatusOverride)(options.state), options.orderNo ?? "");
    },
    hydratePage(override = null, incomingOrderNo = "") {
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
            });
            return;
        }
        try {
            const storedDraft = (0, storage_1.getComplaintDraft)();
            const nextForm = {
                ...storedDraft,
                orderNo: storedDraft.orderNo || incomingOrderNo,
            };
            this.setData({
                status: "ready",
                relatedOrders: (0, storage_1.getOrders)().slice(0, 4),
                submitSuccess: false,
                ticketNo: "",
            });
            this.syncForm(nextForm);
        }
        catch {
            this.setData({
                status: "error",
            });
        }
    },
    syncForm(form) {
        this.setData({
            form,
            canSubmit: canSubmitComplaint(form),
            phoneError: Boolean(form.phone) && !isPhoneValid(form.phone),
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportIndex);
            },
        });
    },
    handleFieldInput(event) {
        const { field } = event.currentTarget.dataset;
        if (!field)
            return;
        const nextForm = {
            ...this.data.form,
            [field]: event.detail.value ?? "",
        };
        this.syncForm(nextForm);
        (0, storage_1.patchComplaintDraft)({
            [field]: nextForm[field],
        });
    },
    handleProblemTypeTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        const nextForm = {
            ...this.data.form,
            problemType: value,
        };
        this.syncForm(nextForm);
        (0, storage_1.patchComplaintDraft)({
            problemType: value,
        });
    },
    handleOrderTap(event) {
        const { orderNo } = event.currentTarget.dataset;
        if (!orderNo)
            return;
        const nextForm = {
            ...this.data.form,
            orderNo,
        };
        this.syncForm(nextForm);
        (0, storage_1.patchComplaintDraft)({
            orderNo,
        });
    },
    handleAddImage() {
        if (this.data.form.images.length >= 3) {
            wx.showToast({
                title: "最多添加 3 张凭证",
                icon: "none",
            });
            return;
        }
        const nextImages = [...this.data.form.images, `现场凭证 ${this.data.form.images.length + 1}`];
        const nextForm = {
            ...this.data.form,
            images: nextImages,
        };
        this.syncForm(nextForm);
        (0, storage_1.patchComplaintDraft)({
            images: nextImages,
        });
    },
    handleRemoveImage(event) {
        const { index } = event.currentTarget.dataset;
        if (typeof index !== "number")
            return;
        const nextImages = this.data.form.images.filter((_, currentIndex) => currentIndex !== index);
        const nextForm = {
            ...this.data.form,
            images: nextImages,
        };
        this.syncForm(nextForm);
        (0, storage_1.patchComplaintDraft)({
            images: nextImages,
        });
    },
    handleSubmit() {
        if (!canSubmitComplaint(this.data.form)) {
            wx.showToast({
                title: this.data.phoneError ? "请输入正确手机号" : "请补全必填信息",
                icon: "none",
            });
            return;
        }
        (0, storage_1.clearComplaintDraft)();
        this.setData({
            submitSuccess: true,
            ticketNo: `TS${Date.now().toString().slice(-8)}`,
        });
        this.syncForm({
            ...support_1.defaultComplaintDraft,
        });
        wx.showToast({
            title: "提交成功",
            icon: "success",
        });
    },
    handleCreateAnother() {
        this.setData({
            submitSuccess: false,
            ticketNo: "",
        });
        this.syncForm({
            ...support_1.defaultComplaintDraft,
        });
    },
    handleGoSupport() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportIndex);
    },
    handleRetry() {
        this.setData({
            status: "loading",
        });
        this.hydratePage();
    },
});
