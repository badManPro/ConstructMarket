# QA Checklist

## Navigation

- TabBar pages open correctly
- Secondary pages open from the documented entry points
- Return paths are sensible after checkout, address selection, coupon selection, and support entry

## Browse and Search

- Search keyword backfill works
- Sort and filter state stay consistent
- More-category drawer and filter drawer behave correctly
- Search empty state and retry state exist

## Product and Trade

- Spec selection gates add-to-cart and buy-now
- Minimum order quantity is enforced
- Cart quantity updates recalculate summary
- Checkout address, coupon, invoice, remark, and payment method all flow through
- Payment success and failure are both reachable
- Order list and order detail reflect local state transitions

## Profile and Service

- Invoice tabs and records behave correctly
- Address create, edit, delete, default, and checkout return-flow work
- Favorite add and remove stay in sync with product detail
- Coupon availability and unavailability are explained
- Profile edit persists expected fields
- Support hub routes correctly to chat, faq, and complaint

## Edge States

- Empty cart
- No search result
- No address
- No coupon
- No invoice record
- No chat history
- Generic error and offline placeholders
