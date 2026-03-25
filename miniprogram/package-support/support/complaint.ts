import { ROUTES } from "../../constants/routes";
import { defaultComplaintDraft, supportProblemTypes } from "../../mock/support";
import type { ComplaintForm, Order, SupportProblemType } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import { clearComplaintDraft, getComplaintDraft, getOrders, patchComplaintDraft } from "../../utils/storage";

function isPhoneValid(phone: string) {
  return /^1\d{10}$/.test(phone);
}

function canSubmitComplaint(form: ComplaintForm) {
  return Boolean(form.contactName.trim() && isPhoneValid(form.phone) && form.problemType && form.description.trim());
}

Page({
  data: {
    status: "loading" as PageStatus,
    form: {
      ...defaultComplaintDraft,
    } as ComplaintForm,
    relatedOrders: [] as Order[],
    problemTypes: supportProblemTypes as SupportProblemType[],
    canSubmit: false,
    phoneError: false,
    submitSuccess: false,
    ticketNo: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.hydratePage(getPageStatusOverride(options.state), options.orderNo ?? "");
  },
  hydratePage(override: PageStatus | null = null, incomingOrderNo = "") {
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
      const storedDraft = getComplaintDraft();
      const nextForm = {
        ...storedDraft,
        orderNo: storedDraft.orderNo || incomingOrderNo,
      };

      this.setData({
        status: "ready",
        relatedOrders: getOrders().slice(0, 4),
        submitSuccess: false,
        ticketNo: "",
      });
      this.syncForm(nextForm);
    } catch {
      this.setData({
        status: "error",
      });
    }
  },
  syncForm(form: ComplaintForm) {
    this.setData({
      form,
      canSubmit: canSubmitComplaint(form),
      phoneError: Boolean(form.phone) && !isPhoneValid(form.phone),
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.supportIndex);
      },
    });
  },
  handleFieldInput(event: WechatMiniprogram.Event & { detail: { value?: string } }) {
    const { field } = event.currentTarget.dataset as { field?: keyof ComplaintForm };
    if (!field) return;

    const nextForm = {
      ...this.data.form,
      [field]: event.detail.value ?? "",
    };

    this.syncForm(nextForm);
    patchComplaintDraft({
      [field]: nextForm[field],
    } as Partial<ComplaintForm>);
  },
  handleProblemTypeTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value) return;

    const nextForm = {
      ...this.data.form,
      problemType: value,
    };

    this.syncForm(nextForm);
    patchComplaintDraft({
      problemType: value,
    });
  },
  handleOrderTap(event: WechatMiniprogram.Event) {
    const { orderNo } = event.currentTarget.dataset as { orderNo?: string };
    if (!orderNo) return;

    const nextForm = {
      ...this.data.form,
      orderNo,
    };

    this.syncForm(nextForm);
    patchComplaintDraft({
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
    patchComplaintDraft({
      images: nextImages,
    });
  },
  handleRemoveImage(event: WechatMiniprogram.Event) {
    const { index } = event.currentTarget.dataset as { index?: number };
    if (typeof index !== "number") return;

    const nextImages = this.data.form.images.filter((_, currentIndex) => currentIndex !== index);
    const nextForm = {
      ...this.data.form,
      images: nextImages,
    };

    this.syncForm(nextForm);
    patchComplaintDraft({
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

    clearComplaintDraft();
    this.setData({
      submitSuccess: true,
      ticketNo: `TS${Date.now().toString().slice(-8)}`,
    });
    this.syncForm({
      ...defaultComplaintDraft,
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
      ...defaultComplaintDraft,
    });
  },
  handleGoSupport() {
    navigateToRoute(ROUTES.supportIndex);
  },
  handleRetry() {
    this.setData({
      status: "loading",
    });
    this.hydratePage();
  },
});
