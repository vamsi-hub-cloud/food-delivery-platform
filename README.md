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
