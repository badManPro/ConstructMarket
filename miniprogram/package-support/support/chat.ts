import { ROUTES } from "../../constants/routes";
import { getProductDetail } from "../../mock/browse";
import { createSupportReply, createSupportSessionMeta, createWelcomeMessages, supportQuickQuestions } from "../../mock/support";
import type { ChatMessage, SupportQuickQuestion, SupportSessionMeta } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import {
  appendSupportChatMessage,
  clearSupportChatMessages,
  getOrderById,
  getOrderByNo,
  getSupportChatMessages,
  patchSupportChatMessage,
} from "../../utils/storage";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatNowTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function stripFailureFlag(text: string) {
  return text.replace(/\s*#fail\s*/g, " ").trim();
}

Page({
  data: {
    status: "loading" as PageStatus,
    sessionMeta: createSupportSessionMeta({}) as SupportSessionMeta,
    messages: [] as ChatMessage[],
    quickQuestions: supportQuickQuestions as SupportQuickQuestion[],
    draftInput: "",
    scrollIntoView: "",
    pendingReply: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    if (options.reset === "1") {
      clearSupportChatMessages();
    }

    let productName = "";
    let orderNo = options.orderNo ?? "";

    if (options.source === "product" && options.productId) {
      productName = getProductDetail(options.productId, []).name;
    }

    if (options.source === "order") {
      const order = getOrderById(options.orderId) ?? getOrderByNo(orderNo);
      orderNo = order?.orderNo ?? orderNo;
    }

    const sessionMeta = createSupportSessionMeta({
      source: options.source,
      productName,
      orderNo,
    });

    this.setData({
      sessionMeta,
    });

    this.hydrateMessages(sessionMeta, getPageStatusOverride(options.state));
  },
  hydrateMessages(sessionMeta: SupportSessionMeta, override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        messages: [],
        scrollIntoView: "",
      });
      return;
    }

    try {
      const messages = getSupportChatMessages(createWelcomeMessages(sessionMeta));
      this.syncMessages(messages);
      this.setData({
        status: messages.length ? "ready" : "empty",
      });
    } catch {
      this.setData({
        status: "error",
        messages: [],
        scrollIntoView: "",
      });
    }
  },
  syncMessages(messages: ChatMessage[]) {
    const lastMessage = messages[messages.length - 1];

    this.setData({
      messages,
      scrollIntoView: lastMessage ? `msg-${lastMessage.id}` : "",
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.supportIndex);
      },
    });
  },
  handleInput(event: WechatMiniprogram.Event & { detail: { value?: string } }) {
    this.setData({
      draftInput: event.detail.value ?? "",
    });
  },
  handleQuickQuestion(event: WechatMiniprogram.Event) {
    const { text } = event.currentTarget.dataset as { text?: string };
    if (!text) return;
    this.sendMessage(text);
  },
  handleSend() {
    this.sendMessage(this.data.draftInput);
  },
  sendMessage(rawText: string, messageId?: string) {
    const normalizedText = stripFailureFlag(rawText);

    if (!normalizedText || this.data.status !== "ready" || this.data.pendingReply) {
      return;
    }

    const shouldFail = rawText.includes("#fail");
    const nextMessages = appendSupportChatMessage({
      id: messageId ?? createMessageId("user"),
      sender: "user",
      text: normalizedText,
      time: formatNowTime(),
      status: shouldFail ? "failed" : "sent",
    });

    this.setData({
      draftInput: "",
    });
    this.syncMessages(nextMessages);

    if (shouldFail) {
      wx.showToast({
        title: "发送失败，请重试",
        icon: "none",
      });
      return;
    }

    this.scheduleReply(normalizedText);
  },
  scheduleReply(messageText: string) {
    this.setData({
      pendingReply: true,
    });

    setTimeout(() => {
      const nextMessages = appendSupportChatMessage({
        id: createMessageId("service"),
        sender: "service",
        text: createSupportReply(messageText, this.data.sessionMeta),
        time: formatNowTime(),
        status: "sent",
      });

      this.syncMessages(nextMessages);
      this.setData({
        pendingReply: false,
      });
    }, 320);
  },
  handleResend(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const current = this.data.messages.find((item) => item.id === id);
    if (!current) return;

    const nextMessage = patchSupportChatMessage(id, {
      status: "sent",
      time: formatNowTime(),
    });

    if (!nextMessage) {
      return;
    }

    this.syncMessages(getSupportChatMessages());
    this.scheduleReply(current.text);
  },
  handleOpenFaq() {
    navigateToRoute(ROUTES.supportFaq);
  },
  handleRetry() {
    this.setData({
      status: "loading",
      pendingReply: false,
    });
    this.hydrateMessages(this.data.sessionMeta);
  },
});
