import { defaultInvoiceDraft, tradePaymentMethods } from "../mock/trade";
import { createTradeApi, type TradeApi } from "../api/modules/trade";
import { getApiConfig, type ApiConfig } from "../api/config";
import { getAddresses, getCartItems, getDefaultAddress, getInvoiceRecords, getOrders } from "../utils/storage";

type TradeServiceDependencies = {
  config?: Partial<ApiConfig>;
  tradeApi?: Partial<TradeApi>;
};

export function createTradeService(dependencies: TradeServiceDependencies = {}) {
  const config = getApiConfig(dependencies.config ?? {});
  const tradeApi = {
    ...createTradeApi({ config }),
    ...(dependencies.tradeApi ?? {}),
  };

  return {
    api: tradeApi,
    getCartShellData() {
      return {
        source: "mock" as const,
        items: getCartItems(),
      };
    },
    getCheckoutShellData() {
      return {
        source: "mock" as const,
        selectedAddress: getDefaultAddress(),
        paymentMethods: tradePaymentMethods,
        invoiceDraft: defaultInvoiceDraft,
      };
    },
    getAddressShellData() {
      return {
        source: "mock" as const,
        addresses: getAddresses(),
      };
    },
    getInvoiceShellData() {
      return {
        source: "mock" as const,
        invoiceRecords: getInvoiceRecords(),
      };
    },
    getOrderShellData() {
      return {
        source: "mock" as const,
        orders: getOrders(),
      };
    },
  };
}
