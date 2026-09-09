# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Wired the console to the real cloudnova-api backend for Authentication, Accounts/Organizations, and Billing (including the new Paystack integration), replacing the mock-only prototype for those domains. Compute, Databases, Storage, Network, and Domains remain mock-data-driven pending their backend milestones.
  - New `lib/api/` HTTP client: a typed fetch wrapper (`lib/api/http.ts`) with Authorization header injection, RFC 7807 Problem Details error parsing, and a single-flight silent access-token refresh (via `POST /auth/refresh-token`) retried once on 401 before dropping the session.
  - `lib/store/auth-context.tsx` rewritten to call real `/auth/*` endpoints (register, verify-email-otp, resend-otp, login, forgot-password, reset-password, refresh-token, me) and to create + switch into a tenant Account on first email verification (registration only creates the User; the Account is created afterward using the company name captured at sign-up).
  - New `lib/store/billing-context.tsx` fetching real wallet balance, usage summary, transactions, invoices, virtual accounts, and (for OWNER/ADMIN) platform margin config; the billing page, header wallet/burn-rate readouts, and sidebar deposit action now read from it instead of mock state.
  - New `app/(dashboard)/team/page.tsx` for account/organization management: list and switch organizations, create a new organization, invite/remove members, and accept an invitation by token.
  - Full dedicated Paystack funding UI in `components/layout/deposit-modal.tsx`: a "Bank Transfer" tab showing the tenant's Dedicated Virtual Account (bank name/account number, with a provisioning button when none exists yet) and a "Pay with Card" tab that redirects to Paystack's hosted Checkout; a new `app/(dashboard)/billing/paystack-callback/page.tsx` return page polls the balance until the webhook-driven credit lands (or times out) after checkout.
  - Removed the mock-only demo affordances that have no real-backend equivalent: the "1-Click Demo Login" / GitHub / Google buttons on the login page, and the client-generated "sample OTP" quick-fill banners on the verify-email and forgot-password pages (OTPs are now real, server-generated, and emailed).
  - `.env.example` / `.env.local` added with `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`, matching the backend's `manage.py runserver` default port).

### Added (previous)
- Complete Next.js 15 App Router frontend architecture for CloudNova.
- New Calm Infrastructure UI design system (Cobalt `#2563EB` accent, deep zinc `#090A0F` canvas, high legibility typography).
- Executive Overview dashboard with real-time Recharts cluster telemetry.
- Compute Droplets management with provisioning modal, power controls, and interactive web terminal.
- Enterprise Managed Databases with connection pools, PITR backups, read replicas, and interactive SQL query console.
- Unified Storage hub integrating NVMe Block Storage volumes and S3 Object Storage spaces with presigned URL generator.
- Networking & Security suite supporting Cloud Firewalls, Layer 4/7 Load Balancers, VPC subnets, Anycast floating IPs, and DDoS shield.
- Domains & Anycast DNS manager with 1-click resource binding and TLD registrar search.
- Billing, Usage & Invoices ledger with multi-rail wallet deposit gateway (Card, FedNow wire, USDC crypto).
- Persistent Light and Dark mode theme system with header toggle, localStorage state synchronization, Tailwind v4 custom variants, and tokenized styling across all components, tables, modals, and charts.
- Public Developer-First Marketing Landing Page at root `/` with Hero section, interactive resource pricing sizing calculator comparing AWS/GCP, interactive CLI/Terraform/API tabs, global Anycast latency grid, and customer proof.
- End-to-end Authentication Suite:
  - `AuthProvider` context with session persistence in `localStorage` and demo session state.
  - Sign In (`/login`) with email/password, password visibility toggle, remember-me, and 1-click demo login.
  - Sign Up (`/register`) with live password strength meter and terms agreement.
  - Email OTP Verification (`/verify-email`) with 6-digit individual auto-advancing pin boxes, quick-fill test button, countdown resend timer, and instant session establishment.
  - Two-Step Forgot Password (`/forgot-password`) with 6-digit OTP verification and new password creation.
  - User profile menu in header with user details, landing page link, and sign-out action.

### Removed
- Removed legacy Reseller & Margins engine (`/reseller`), markup multipliers, and profit simulator in favor of direct developer cloud infrastructure metrics (99.995% SLA, Committed discounts).

### Fixed
- Removed restrictive `max-w-7xl` container width constraint from main dashboard layout, enabling fluid full-width rendering across wide and ultra-wide screens without empty horizontal margins.
