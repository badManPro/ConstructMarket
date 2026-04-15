"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SORT_OPTION = exports.ARTICLE_CATEGORY = exports.COUPON_STATUS = exports.INVOICE_STATUS = exports.INVOICE_TYPE = exports.PAYMENT_STATUS = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = [
    "pending_payment",
    "pending_shipment",
    "pending_receipt",
    "completed",
    "after_sale",
    "cancelled",
];
exports.PAYMENT_STATUS = ["unpaid", "paying", "success", "failed"];
exports.INVOICE_TYPE = ["electronic", "paper"];
exports.INVOICE_STATUS = ["can_apply", "applying", "issued", "rejected"];
exports.COUPON_STATUS = ["available", "used", "expired", "unavailable"];
exports.ARTICLE_CATEGORY = ["industry_news", "product_knowledge", "renovation_guide"];
exports.SORT_OPTION = ["default", "sales_desc", "price_asc", "price_desc", "brand"];
