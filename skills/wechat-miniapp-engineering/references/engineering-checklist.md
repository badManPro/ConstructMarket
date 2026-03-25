# Engineering Checklist

## Suggested Structure

```text
miniprogram/
  app.ts
  app.json
  app.wxss
  config/
  constants/
  styles/
  utils/
  mock/
  store/modules/
  components/base/
  components/business/
  custom-tab-bar/
  pages/home/
  pages/category/
  pages/cart/
  pages/profile/
  package-catalog/
  package-content/
  package-trade/
  package-profile/
  package-support/
```

## Package Boundaries

- Main package: app shell, tabbar pages, shared assets, global components
- `package-catalog`: search, product, category-adjacent secondary pages
- `package-content`: article list and detail
- `package-trade`: checkout, payment result, order pages
- `package-profile`: invoice, address, coupon, favorite, profile info
- `package-support`: support hub, chat, faq, complaint

## Shared Before Parallel

1. App config and route constants
2. Design tokens and theme variables
3. Type models, enums, and mock factories
4. Storage wrapper and global store modules
5. Base UI states and reusable business cards

## Good Use of Component Library

- Buttons
- Inputs
- Tabs
- Popup or drawer primitives
- Toast, dialog, badge, steps, uploader

## Must Stay Custom

- Product card
- Order card
- Address card
- Coupon card
- Invoice card
- Filter drawer
- Spec selector
- Chat bubble and quick-question panel
