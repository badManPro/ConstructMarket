# Domain Checklist

## Scope Defaults

- Native WeChat mini program frontend
- Local Mock data only
- Enterprise or engineering procurement tone
- No backend, real payment, CMS, approval, ERP, or push service

## Page Domains

- Browse: home, category, search, article list/detail, product detail
- Trade: cart, checkout, payment result, order list/detail
- Profile: mine, invoice, address list/edit, favorite, coupon, info
- Support: support hub, chat, faq, complaint

## Core Entities

- `Category`
- `ProductCard`
- `ProductDetail`
- `CartItem`
- `Order`
- `InvoiceRecord`
- `Address`
- `Coupon`
- `UserProfile`
- `FaqItem`
- `ComplaintForm`
- `PaymentMethod`

## Global State Buckets

- `authState`
- `homeState`
- `searchState`
- `cartState`
- `favoriteState`
- `checkoutState`
- `orderState`
- `supportState`
- `uiState`

## Core Flows

1. Browse and search: home -> search -> product detail
2. Category selection: category -> search or product detail
3. Trade: product detail -> cart or checkout -> payment result -> order detail
4. Content: home -> article list -> article detail
5. Service: profile or order/product detail -> support pages
