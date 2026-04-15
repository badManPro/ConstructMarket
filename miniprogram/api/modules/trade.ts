import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type TradeApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createTradeApi(dependencies: TradeApiDependencies = {}) {
  const config = dependencies.config;

  return {
    getCart() {
      return apiRequest<unknown[]>({
        path: "/v1/app/user/cart",
        method: "GET",
        config,
      });
    },
    updateCartQuantity(cartItemId: string, quantity: number) {
      return apiRequest<void>({
        path: `/v1/app/user/cart/${cartItemId}/quantity`,
        method: "POST",
        data: {
          quantity,
        },
        config,
      });
    },
    deleteCartItem(cartItemId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/cart/${cartItemId}`,
        method: "DELETE",
        config,
      });
    },
    clearCart() {
      return apiRequest<void>({
        path: "/v1/app/user/cart",
        method: "DELETE",
        config,
      });
    },
    listAddresses() {
      return apiRequest<unknown[]>({
        path: "/v1/app/user/address",
        method: "GET",
        config,
      });
    },
    createAddress(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/address",
        method: "POST",
        data,
        config,
      });
    },
    updateAddress(addressId: string, data: Record<string, unknown>) {
      return apiRequest<void>({
        path: `/v1/app/user/address/${addressId}`,
        method: "PUT",
        data,
        config,
      });
    },
    deleteAddress(addressId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/address/${addressId}`,
        method: "DELETE",
        config,
      });
    },
    listInvoiceTitles() {
      return apiRequest<unknown[]>({
        path: "/v1/app/user/invoice/titles",
        method: "GET",
        config,
      });
    },
    createInvoiceTitle(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/invoice/titles",
        method: "POST",
        data,
        config,
      });
    },
    updateInvoiceTitle(invoiceTitleId: string, data: Record<string, unknown>) {
      return apiRequest<void>({
        path: `/v1/app/user/invoice/titles/${invoiceTitleId}`,
        method: "PUT",
        data,
        config,
      });
    },
    deleteInvoiceTitle(invoiceTitleId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/invoice/titles/${invoiceTitleId}`,
        method: "DELETE",
        config,
      });
    },
    listInvoiceRecords(data: Record<string, unknown> = {}) {
      return apiRequest<unknown>({
        path: "/v1/app/user/invoice/records",
        method: "POST",
        data,
        config,
      });
    },
    applyInvoiceRecord(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/invoice/records/apply",
        method: "POST",
        data,
        config,
      });
    },
    listOrders(data: Record<string, unknown> = {}) {
      return apiRequest<unknown>({
        path: "/v1/app/user/orders",
        method: "POST",
        data,
        config,
      });
    },
    getOrderDetail(orderId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/user/orders/detail",
        method: "GET",
        data: {
          orderId,
        },
        config,
      });
    },
    payOrder(data: Record<string, unknown>) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/user/orders/pay",
        method: "POST",
        data,
        config,
      });
    },
    confirmReceipt(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/orders/confirm-receipt",
        method: "POST",
        data,
        config,
      });
    },
    applyAfterSale(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/orders/after-sale",
        method: "POST",
        data,
        config,
      });
    },
  };
}

export type TradeApi = ReturnType<typeof createTradeApi>;
