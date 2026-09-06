# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
