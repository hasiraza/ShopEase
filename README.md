# 🛒 ShopEase — E-Commerce Admin Dashboard

<div align="center">

![ShopEase Banner](https://img.shields.io/badge/ShopEase-Admin%20v1.0-6c63ff?style=for-the-badge&logo=shopify&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-yellow?style=for-the-badge)

**A full-featured, professional e-commerce admin panel with real-time analytics, inventory management, customer tracking, and a customer-facing storefront — all in one app.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Configuration](#-configuration) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ShopEase** is a production-ready e-commerce admin dashboard built with **React + TypeScript** on the frontend and **MongoDB Atlas** (with an offline-first SQLite/JSON sandbox fallback) on the backend. It gives shop owners a complete 360° view of their business — from revenue analytics to per-customer order history — while also serving a customer-facing storefront from the same codebase.

> The app auto-detects whether a live MongoDB connection is available. If not, it gracefully falls back to a high-fidelity in-memory sandbox so development and demos are never blocked.

---

## ✨ Features

### 🖥️ Admin Panel
- **Dashboard** — KPI cards (Revenue, Orders, Customers, Products), monthly revenue bar chart, order status donut chart, recent orders table, and low-stock alerts
- **Products** — Full product catalogue with category filtering, stock levels, and add-product form; one-click preview on the storefront
- **Customers** — Customer list with drill-down drawer showing full order history per customer
- **Orders** — Order management with line-item breakdown, status badges, and linked payment records
- **Payments** — Payment ledger with status tracking (COMPLETED / PENDING / FAILED)
- **Analytics** — Deep-dive charts: revenue over time, top products, customer city distribution, category performance

### 🛍️ Customer Storefront
- Browse products by category
- Product detail view with stock indicator
- Cart and checkout flow linked to live order data
- Seamlessly switch between Admin and Storefront views

### 🗄️ Database
- **MongoDB Atlas** — live cloud database when `MONGODB_URI` is configured
- **Offline Sandbox** — automatic SQLite/JSON emulation when Atlas is unreachable
- **Auto-seed** — database is populated with realistic demo data on first run

### 🔐 Authentication
- Email-based admin login / signup
- Session persisted via `localStorage`
- Sign-out clears session instantly

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Icons** | Lucide React |
| **Charts** | HTML5 Canvas (custom, no library) |
| **Database (live)** | MongoDB Atlas |
| **Database (offline)** | SQLite / JSON Sandbox |
| **Auth** | localStorage session |
| **Build Tool** | Vite |
| **Package Manager** | npm |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version   # v18.0.0 or higher
npm --version    # v9.0.0 or higher
```

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/shopease.git
cd shopease
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Then edit `.env` with your values (see [Environment Variables](#-environment-variables)).

**4. Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

**5. Build for production**

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
shopease/
├── public/                   # Static assets
├── src/
│   ├── components/           # React view components
│   │   ├── AuthScreen.tsx        # Login / signup screen
│   │   ├── DashboardView.tsx     # Main dashboard with KPIs & charts
│   │   ├── ProductsView.tsx      # Product catalogue management
│   │   ├── CustomersView.tsx     # Customer list & detail drawer
│   │   ├── OrdersView.tsx        # Order management table
│   │   ├── PaymentsView.tsx      # Payment ledger
│   │   ├── AnalyticsView.tsx     # Advanced analytics charts
│   │   └── StorefrontView.tsx    # Customer-facing shop
│   ├── model/
│   │   ├── service.ts            # All database fetch/write functions
│   │   └── seed.ts               # Database seeding logic
│   ├── types.ts                  # Shared TypeScript types & helpers
│   ├── App.tsx                   # Root component, routing, state
│   └── main.tsx                  # React entry point
├── .env.example              # Example environment config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Atlas connection string (optional — app works offline without it)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopease?retryWrites=true&w=majority

# App environment
NODE_ENV=development

# Optional: Port override
PORT=5173
```

> **Note:** If `MONGODB_URI` is not set or the cluster is unreachable, ShopEase automatically activates its offline-first sandbox mode. No crash, no data loss.

---

## 🗄️ Database Setup

### Option A — MongoDB Atlas (Recommended for Production)

**1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)**

**2. Get your connection string**

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopease
```

**3. Whitelist your IP address**

Navigate to **Security → Network Access → Add IP Address** and add:

```
0.0.0.0/0
```

**4. Paste the URI into your `.env` file and restart the app.**

The app will auto-seed the database with sample data on first connection.

---

### Option B — Offline Sandbox (Default / Zero Config)

No setup needed. If `MONGODB_URI` is absent or the Atlas cluster is unreachable, ShopEase switches to its built-in JSON/SQLite emulation layer automatically. All features work identically — perfect for local development and demos.

---

### Seeding the Database

The database is **auto-seeded on first run** if empty. To manually force a reseed:

```ts
// Via the UI: click "🔄 Refill Database" in the sidebar
// Or programmatically:
import { seedDatabase } from './model/seed';
await seedDatabase();
```

---

## 📡 API Reference

All data access goes through `src/model/service.ts`. Key functions:

```ts
// Fetch collections
fetchCategories()   → Promise<Category[]>
fetchCustomers()    → Promise<Customer[]>
fetchProducts()     → Promise<Product[]>
fetchOrders()       → Promise<Order[]>
fetchOrderItems()   → Promise<OrderItem[]>
fetchPayments()     → Promise<Payment[]>

// Write operations
addProductToDb(product: Product)  → Promise<void>

// Meta
fetchDbStatus()     → Promise<{ isMongo: boolean; uriConfigured: boolean; connectionError: string }>
isDatabaseEmpty()   → Promise<boolean>
```

---

## 🧩 Key TypeScript Types

```ts
// src/types.ts

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  stock_qty: number;
  category_id: number;
  description?: string;
}

interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;         // ISO string e.g. "2024-03-15"
  total_amount: number;
  status: OrderStatus;
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  payment_date: string;
}

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
}
```

---

## 🎨 Theming & Styling

ShopEase uses **Tailwind CSS** with a custom accent palette:

```css
/* Primary brand color */
--color-primary: #6c63ff;
--color-primary-hover: #5b54e0;

/* Sidebar */
--color-sidebar-bg: #1a1f36;
--color-sidebar-text: #8892b0;

/* App background */
--color-app-bg: #f0f2f5;
```

To customize the theme, edit `tailwind.config.ts`:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6c63ff',
          hover: '#5b54e0',
        },
      },
    },
  },
};
```

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run test` | Run test suite |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

**1. Fork the repository**

```bash
git clone https://github.com/your-username/shopease.git
```

**2. Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

**3. Commit your changes**

```bash
git commit -m "feat: add your feature description"
```

> We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

**4. Push and open a Pull Request**

```bash
git push origin feature/your-feature-name
```

---

## 🐛 Reporting Issues

Found a bug? [Open an issue](https://github.com/your-username/shopease/issues) with:

- Steps to reproduce
- Expected vs actual behavior
- Browser / Node version
- Screenshots if applicable

---

## 📄 License

```
Copyright 2024 ShopEase Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

<div align="center">

Built with ❤️ using **React**, **TypeScript**, **Tailwind CSS**, and **MongoDB**

⭐ Star this repo if you found it useful!

</div>