export const ORDER_STATUS = [
  "pending_payment",
  "pending_shipment",
  "pending_receipt",
  "completed",
  "after_sale",
  "cancelled",
] as const;

export const PAYMENT_STATUS = ["unpaid", "paying", "success", "failed"] as const;
export const INVOICE_TYPE = ["electronic", "paper"] as const;
export const INVOICE_STATUS = ["can_apply", "applying", "issued", "rejected"] as const;
export const COUPON_STATUS = ["available", "used", "expired", "unavailable"] as const;
export const ARTICLE_CATEGORY = ["industry_news", "product_knowledge", "renovation_guide"] as const;
export const SORT_OPTION = ["default", "sales_desc", "price_asc", "price_desc", "brand"] as const;
