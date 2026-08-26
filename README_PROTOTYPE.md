# Meridian ERP — Sales & Finance Frontend Demo

Frontend demo (mock data only, no backend) covering two modules: **Sales/CRM** and
**Finance/Accounting**, plus a login screen with role-based access control.
Built with Angular 18 (standalone components) + PrimeNG + Chart.js, RTL Arabic UI.

## Run locally

```bash
cd erp-frontend
npm install
npm start
```

Then open http://localhost:4200 — you'll land on the login screen.

## Login & access management

Authentication is fully static (`src/app/core/auth/auth.service.ts`) — no backend, no
tokens, just an in-memory list of demo users checked against a typed password, with the
signed-in user persisted to `localStorage` so a refresh keeps you logged in. Three demo
accounts, each with a different role and a different slice of the app:

| Role | Email | Password | Sees |
|---|---|---|---|
| مدير عام (Admin) | admin@meridian.com | admin123 | Sales **and** Finance |
| مندوب مبيعات (Sales rep) | sales@meridian.com | sales123 | Sales only |
| محاسبة (Accountant) | accounting@meridian.com | finance123 | Finance only |

The login screen has one-click "quick login" cards for all three. Route guards
(`src/app/core/auth/auth.guard.ts`) enforce access per module — a signed-in sales rep who
manually navigates to `/finance/*` is redirected back to their own dashboard, and vice
versa. The sidebar only ever renders the sections a user actually has access to.

## What's included

**Sales/CRM**
- **Dashboard** (`/dashboard`) — KPI cards with sparklines, monthly sales chart (actual
  vs target), sales rep leaderboard, customer follow-up alerts, recent quotes.
- **Customer List** (`/customers`) — searchable/filterable customer table (tier, status).
- **Customer 360° Profile** (`/customers/:id`) — full customer record with tabs for
  communication history, quotes, and sales orders.
- **Quotes** (`/quotes`) — unified quote list across all sales reps with status filtering.

**Finance/Accounting**
- **Finance Dashboard** (`/finance/dashboard`) — KPI cards (outstanding, overdue,
  collected this month, avg. collection days), invoiced-vs-collected chart, an aging
  report (1-30 / 31-60 / 61-90 / 90+ days), top overdue clients, and recent invoices.
- **Invoices** (`/finance/invoices`) — full invoice lifecycle: create an invoice with
  dynamic line items (auto tax/subtotal/total), save as draft or issue & send, record
  partial/full payments (status recalculates automatically), send a reminder, cancel an
  invoice with a confirm dialog, and view a full invoice detail with payment history.
- **Client Financial Status** (`/finance/clients`) — every client's credit limit, credit
  usage, outstanding/overdue balance, payment behavior, and average payment days, with a
  drill-down dialog listing that client's invoices.

Locked "أقسام قادمة" sidebar items (Collections, HR) represent future phases and are
non-interactive by design, to preview the full navigation structure to the client.

All data is mocked in `src/app/core/data/mock-data.service.ts` (Sales) and
`src/app/core/data/finance-data.service.ts` (Finance) — no API calls, no backend. Actions
like creating an invoice or recording a payment mutate the in-memory mock arrays for the
duration of the session (nothing persists across a reload except the logged-in user).

## Stack

- Angular 18 (standalone components, no NgModules)
- PrimeNG 18 (data tables, tabs, dialogs, dropdowns, toast, confirm dialog)
- Chart.js (sales & finance trend charts)
- SCSS with a token-based design system (see `src/styles.scss` — CSS custom properties)
- RTL Arabic layout (`index.html` sets `dir="rtl" lang="ar"`)

> **Note:** `primeng` is pinned to the last non-LTS `18.x` release (`18.0.2`). The
> `-lts` tagged 18.x patches inject an unremovable license-nag banner (fixed, max
> z-index, inline `!important`) that overlaps the topbar and blocks clicks when no
> license key is configured — not worth it for a demo repo.

## Design system quick reference

Colors, spacing, and typography are defined as CSS variables in `src/styles.scss` under `:root`.
Key tokens: `--navy-900` (primary/sidebar), `--steel-600` (accent), `--success/warning/danger-600`
(status colors), `--font-ui` (Inter), `--font-mono` (IBM Plex Mono, used for all financial figures
via the `.num` class). The same file also hand-styles PrimeNG's dialog/dropdown/toast/confirm-dialog
chrome (mask, panel, overlay) to match these tokens, since PrimeNG 18 ships no default theme CSS.

## Next steps (not in this demo)

- Real backend integration (.NET API + PostgreSQL)
- Real authentication (hashed passwords, sessions/JWT, SSO)
- Form validation on quote/invoice/customer creation dialogs
- Collections, HR modules (Phases 3-4)
