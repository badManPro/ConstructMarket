"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../mock/browse");
const support_1 = require("../../services/support");
const support_2 = require("../../mock/support");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
function createMessageId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
function formatNowTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}
function stripFailureFlag(text) {
    return text.replace(/\s*#fail\s*/g, " ").trim();
}
Page({
    data: {
        status: "loading",
        sessionMeta: (0, support_2.createSupportSessionMeta)({}),
        messages: [],
        quickQuestions: support_2.supportQuickQuestions,
        draftInput: "",
        scrollIntoView: "",
        pendingReply: false,
    },
    onLoad(options) {
        if (options.reset === "1") {
            (0, storage_1.clearSupportChatMessages)();
        }
        let productName = "";
        let orderNo = options.orderNo ?? "";
        if (options.source === "product" && options.productId) {
            productName = (0, browse_1.getProductDetail)(options.productId, []).name;
        }
        if (options.source === "order") {
            const order = (0, storage_1.getOrderById)(options.orderId) ?? (0, storage_1.getOrderByNo)(orderNo);
            orderNo = order?.orderNo ?? orderNo;
        }
        const sessionMeta = (0, support_2.createSupportSessionMeta)({
            source: options.source,
            productName,
            orderNo,
        });
        this.setData({
            sessionMeta,
        });
        this.hydrateMessages(sessionMeta, (0, page_1.getPageStatusOverride)(options.state));
    },
    hydrateMessages(sessionMeta, override = null) {
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
            const messages = (0, storage_1.getSupportChatMessages)((0, support_2.createWelcomeMessages)(sessionMeta));
            this.syncMessages(messages);
            this.setData({
                status: messages.length ? "ready" : "empty",
            });
        }
        catch {
            this.setData({
                status: "error",
                messages: [],
                scrollIntoView: "",
            });
        }
    },
    syncMessages(messages) {
        const lastMessage = messages[messages.length - 1];
        this.setData({
            messages,
            scrollIntoView: lastMessage ? `msg-${lastMessage.id}` : "",
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportIndex);
            },
        });
    },
    handleInput(event) {
        this.setData({
            draftInput: event.detail.value ?? "",
        });
    },
    handleQuickQuestion(event) {
        const { text } = event.currentTarget.dataset;
        if (!text)
            return;
        this.sendMessage(text);
    },
    handleSend() {
        this.sendMessage(this.data.draftInput);
    },
    sendMessage(rawText, messageId) {
        const normalizedText = stripFailureFlag(rawText);
        if (!normalizedText || this.data.status !== "ready" || this.data.pendingReply) {
            return;
        }
        const shouldFail = rawText.includes("#fail");
        const nextMessages = (0, storage_1.appendSupportChatMessage)({
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
        void this.scheduleReply(normalizedText, nextMessages[nextMessages.length - 1]?.id ?? "");
    },
    async scheduleReply(messageText, messageId) {
        this.setData({
            pendingReply: true,
        });
        try {
            const userProfile = (0, storage_1.getUserProfile)();
            await (0, support_1.createSupportService)().submitConsultMessage({
                contactName: userProfile.companyName || userProfile.nickname,
                mobile: userProfile.phone,
                consultContentText: messageText,
            });
            setTimeout(() => {
                const nextMessages = (0, storage_1.appendSupportChatMessage)({
                    id: createMessageId("service"),
                    sender: "service",
                    text: (0, support_2.createSupportReply)(messageText, this.data.sessionMeta),
                    time: formatNowTime(),
                    status: "sent",
                });
                this.syncMessages(nextMessages);
                this.setData({
                    pendingReply: false,
                });
            }, 320);
        }
        catch {
            (0, storage_1.patchSupportChatMessage)(messageId, {
                status: "failed",
            });
            this.syncMessages((0, storage_1.getSupportChatMessages)());
            this.setData({
                pendingReply: false,
            });
            wx.showToast({
                title: "留言发送失败，请重试",
                icon: "none",
            });
        }
    },
    handleResend(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const current = this.data.messages.find((item) => item.id === id);
        if (!current)
            return;
        const nextMessage = (0, storage_1.patchSupportChatMessage)(id, {
            status: "sent",
            time: formatNowTime(),
        });
        if (!nextMessage) {
            return;
        }
        this.syncMessages((0, storage_1.getSupportChatMessages)());
        void this.scheduleReply(current.text, id);
    },
    handleOpenFaq() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.supportFaq);
    },
    handleRetry() {
        this.setData({
            status: "loading",
            pendingReply: false,
        });
        this.hydrateMessages(this.data.sessionMeta);
    },
});
