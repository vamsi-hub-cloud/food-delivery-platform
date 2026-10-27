# 🍔 FoodiGo — Food Delivery Platform

A modern, responsive food delivery frontend built with **React + Vite**, **Tailwind CSS**, **React Router**, **Context API** and **Framer Motion**.

## Features
- **Home** – hero with search, offer carousel (click to copy coupon), category chips, restaurant grid with sort + pure-veg filter
- **Restaurants** – full listing with search (restaurant / cuisine / dish) and category filter
- **Restaurant detail & menu** – info bar, sticky search + category tabs, veg toggle, bestseller tags
- **Food customisation** – size, add-ons, special instructions and quantity in an animated modal with live price
- **Cart** – quantity management, remove/clear, single-restaurant rule (replace-cart confirmation), minimum order check, persisted in **LocalStorage**
- **Coupons** – `WELCOME50`, `FREEDEL`, `FLAT100`, `WEEKEND20` with minimum-order and max-discount validation
- **Price calculation** – subtotal, delivery fee, discount, 5% tax, total
- **Checkout** – full form validation (name, phone, email, address, pincode, card / UPI details), inline errors, auto-formatting, saved delivery profile
- **Order confirmation** – animated success page with order summary
- **Order tracking** – live status timeline (Placed → Confirmed → Preparing → Out for delivery → Delivered) with progress bar
- **Order history** – persisted orders with Track / Details / Reorder
- **Responsive** – mobile, tablet and desktop layouts; **Animations** – page transitions, hover/tap effects, modals, toasts

## What's new in v2
- **Product detail view** – tap any dish for calories, macros (animated bars), prep time, serves, spice level, ingredients, allergens, ratings and "pairs well with". Deep link: `/restaurant/r1?item=m1`
- **More home sections** – animated hero + cuisine marquee, trending dishes, how it works, count-up stats, why FoodiGo, testimonials carousel, partner CTAs, FAQ accordion
- **Restaurant page** – address / hours / contact cards, ratings breakdown, customer reviews, similar restaurants
- **Footer** – newsletter signup (validated) and an interactive **city branches** selector (12 cities, 22 branches) with addresses and phone numbers
- **More colour & motion** – gradient themes per cuisine/restaurant, scroll-reveal, floating emojis, confetti on order success, animated gradients (respects `prefers-reduced-motion`)
- Nutrition, ratings, reviews and branches are **mock data** generated for the demo (`src/data/enrich.js`, `src/data/content.js`)

## 🔐 Admin Flow (v3)
Open **`/admin`** (also linked from the footer). Demo logins:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@foodigo.com | admin123 |
| Operations Manager | ops@foodigo.com | ops123 |
| Finance Manager | finance@foodigo.com | finance123 |

The sidebar and routes adapt to each role's permissions (managed in *Roles & Permissions*).

| # | Module | Routes | What it covers |
|---|---|---|---|
| 1 | Dashboard & Analytics | `/admin`, `/admin/analytics` | KPIs (orders, revenue, active users, earnings), revenue trend, status donut, peak-hour chart + heatmap, recent activities, category / dish / zone performance |
| 2 | Order Management | `/admin/orders`, `/admin/orders/:id` | All / pending / confirmed / active deliveries / delivered / cancelled / refund-request tabs, accept & reject, status tracking timeline, partner assignment, cancel with refund, refund creation |
| 3 | Restaurant & Menu | `/admin/restaurants`, `/admin/restaurants/:id` | Listing, registration form (FSSAI/GST/PAN validation), approval & document verification, menu CRUD, categories, pricing, availability, operating hours, ratings & review moderation, commission |
| 4 | Delivery Partners | `/admin/partners`, `/admin/partners/:id` | Registration, KYC document verification, online/offline, manual + auto order assignment, live tracking cards, delivery history, earnings, performance, payouts |
| 5 | Customers | `/admin/customers`, `/admin/customers/:id` | Listing, profile & contact edit, order history, addresses, refunds, reviews, complaints, suspend / block / reactivate |
| 6 | Payments & Finance | `/admin/payments?tab=` | Overview, transactions, failed payments, restaurant settlements, partner payouts, commissions, refunds, GST taxes, CSV financial reports |
| 7 | Offers & Promotions | `/admin/offers?tab=` | Coupon CRUD (limits, min order, expiry), discount campaigns, referral program, campaign analytics |
| 8 | Support, Reports & Settings | `/admin/support`, `notifications`, `reports`, `zones`, `pricing`, `roles`, `settings`, `audit` | Tickets & disputes, broadcast notifications, report builder + CSV, delivery zones, pricing & surge rules, roles/permissions/admin users, platform settings, audit logs |

**How it works**
- All admin data is mocked locally (`src/admin/data/seed.js`) and persisted in LocalStorage (`foodigo_admin_v1`). Use *Platform Settings → Reset demo data* to restore it.
- **Orders placed on the customer site appear in the admin Orders list live** (flagged `NEW`) and can be accepted, assigned, cancelled or refunded.
- Every admin action is written to the **Audit Log** automatically.
- The admin bundle is lazy-loaded, so the customer site stays light.
- Charts are lightweight custom SVG components (no chart library).

## Getting started
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview
```

## Folder structure
```
src/
├── admin/        # Admin flow: AdminApp, context, data seed, components (ui kit, charts, tables), pages
├── components/   # reusable UI (Navbar, RestaurantCard, FoodCard, CustomizeModal, CouponBox, OrderTimeline…)
├── context/      # CartContext, OrderContext, ToastContext
├── data/         # restaurants + menus, coupons, customisation options
├── hooks/        # useLocalStorage
├── pages/        # Home, Restaurants, RestaurantDetail, Cart, Checkout, OrderConfirmation, OrderTracking, OrderHistory, NotFound
└── utils/        # pricing, validators, formatting, order status helpers
```

## State management
| Context | Responsibility |
|---|---|
| `CartContext` | `useReducer` cart (items, restaurant, coupon), totals, persisted to LocalStorage |
| `OrderContext` | Placed orders, persisted to LocalStorage |
| `ToastContext` | Global toast notifications |

## Notes
- All data is mocked locally (`src/data`). No backend or real payments.
- Order status is **simulated**: it advances every 15 seconds (`STAGE_MS` in `src/utils/orderStatus.js`).
- Restaurant photos load from Unsplash; a gradient/emoji fallback shows if offline.

## Deployment
- **Vercel / Netlify**: build command `npm run build`, output directory `dist`. SPA rewrites are included (`vercel.json`, `public/_redirects`).

## Test checklist
Search & filters · customise item · add / increase / decrease / remove · switch restaurant prompt · each coupon (valid, below-minimum, invalid) · checkout validation (each payment type) · confirmation · tracking timeline · history & reorder · refresh persistence · mobile / tablet / desktop widths.
