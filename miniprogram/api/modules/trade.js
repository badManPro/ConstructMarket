"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTradeApi = createTradeApi;
const request_1 = require("../request");
function createTradeApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        getCart() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/cart",
                method: "GET",
                config,
            });
        },
        addCartItem(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/cart",
                method: "POST",
                data,
                config,
            });
        },
        updateCartQuantity(cartItemId, quantity) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/cart/${cartItemId}/quantity`,
                method: "POST",
                data: {
                    quantity,
                },
                config,
            });
        },
        deleteCartItem(cartItemId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/cart/${cartItemId}`,
                method: "DELETE",
                config,
            });
        },
        clearCart() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/cart",
                method: "DELETE",
                config,
            });
        },
        listAddresses() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/address",
                method: "GET",
                config,
            });
        },
        createAddress(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/address",
                method: "POST",
                data,
                config,
            });
        },
        updateAddress(addressId, data) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/address/${addressId}`,
                method: "PUT",
                data,
                config,
            });
        },
        deleteAddress(addressId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/address/${addressId}`,
                method: "DELETE",
                config,
            });
        },
        listInvoiceTitles() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/invoice/titles",
                method: "GET",
                config,
            });
        },
        createInvoiceTitle(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/invoice/titles",
                method: "POST",
                data,
                config,
            });
        },
        updateInvoiceTitle(invoiceTitleId, data) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/invoice/titles/${invoiceTitleId}`,
                method: "PUT",
                data,
                config,
            });
        },
        deleteInvoiceTitle(invoiceTitleId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/invoice/titles/${invoiceTitleId}`,
                method: "DELETE",
                config,
            });
        },
        listInvoiceRecords(data = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/invoice/records",
                method: "POST",
                data,
                config,
            });
        },
        applyInvoiceRecord(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/invoice/records/apply",
                method: "POST",
                data,
                config,
            });
        },
        listOrders(data = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/orders",
                method: "POST",
                data,
                config,
            });
        },
        getOrderDetail(orderId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/orders/detail",
                method: "GET",
                data: {
                    orderId,
                },
                config,
            });
        },
        payOrder(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/orders/pay",
                method: "POST",
                data,
                config,
            });
        },
        confirmReceipt(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/orders/confirm-receipt",
                method: "POST",
                data,
                config,
            });
        },
        applyAfterSale(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/orders/after-sale",
                method: "POST",
                data,
                config,
            });
        },
    };
}
