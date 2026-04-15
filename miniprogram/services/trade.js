"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTradeService = createTradeService;
const trade_1 = require("../mock/trade");
const trade_2 = require("../api/modules/trade");
const config_1 = require("../api/config");
const storage_1 = require("../utils/storage");
function createTradeService(dependencies = {}) {
    const config = (0, config_1.getApiConfig)(dependencies.config ?? {});
    const tradeApi = {
        ...(0, trade_2.createTradeApi)({ config }),
        ...(dependencies.tradeApi ?? {}),
    };
    return {
        api: tradeApi,
        getCartShellData() {
            return {
                source: "mock",
                items: (0, storage_1.getCartItems)(),
            };
        },
        getCheckoutShellData() {
            return {
                source: "mock",
                selectedAddress: (0, storage_1.getDefaultAddress)(),
                paymentMethods: trade_1.tradePaymentMethods,
                invoiceDraft: trade_1.defaultInvoiceDraft,
            };
        },
        getAddressShellData() {
            return {
                source: "mock",
                addresses: (0, storage_1.getAddresses)(),
            };
        },
        getInvoiceShellData() {
            return {
                source: "mock",
                invoiceRecords: (0, storage_1.getInvoiceRecords)(),
            };
        },
        getOrderShellData() {
            return {
                source: "mock",
                orders: (0, storage_1.getOrders)(),
            };
        },
    };
}
