# ☁️ Nexas Cloud

Nexas is a next-generation **Platform as a Service (PaaS)** that allows developers to deploy applications, bots, and services directly from GitHub with **zero setup**, **edge-native performance**, and a **secure coin-based economy**.

Think: **Heroku + Replit + Edge Workers**, rebuilt with modern security and community-first design.

---

## 🚀 Core Capabilities

- One-click deploy from GitHub
- Host web apps, bots, and workers
- Edge-native serverless architecture
- Secure JWT + OAuth authentication
- Immutable coin economy (Nexus Coins)
- Admin-controlled governance
- Built-in forum & real-time chat
- Modern cyber-cloud UI with fluid animations

---

## 🧱 Architecture Overview

Nexas uses a **zero-trust, edge-first architecture**:

- **Frontend**: Vanilla JS + Web APIs (no build step)
- **Backend**: Edge Functions (Vercel / Render)
- **Storage**: KV-style JSON storage (edge-safe)
- **Security**: JWT, OAuth, rate limits, audit logs
- **Isolation**: Per-app sandboxing (edge scope)
- **Scaling**: CDN + stateless execution

---

## 🛠️ Tech Rules (Non-Negotiable)

- ❌ No npm / yarn / pnpm
- ❌ No build steps
- ❌ No system commands
- ✅ CDN-based ESM imports only
- ✅ Edge-compatible APIs only
- ✅ Must run immediately after deployment
- ✅ All security enforced server-side

---

## 🪙 Nexus Coin Economy

- Nexus Coins are used for:
  - Hosting apps
  - Upgrading plans
  - Resource boosts
- Coins are tracked using an **immutable ledger**
- Admin account has infinite coins (server-only)
- Anti-fraud rules enforced at API level

---

## 🔐 Security Model

- JWT-based authentication
- GitHub OAuth login
- Password hashing
- CSRF & XSS protection
- Rate limiting per IP & user
- Audit logs (immutable)
- Admin-only protected routes
- Zero-trust API access

---

## 📁 Project Structure

nexas-cloud/
│
├── index.html          # Entry UI
├── app.js              # Frontend controller
├── styles.css          # UI / animations
│
├── /edge               # All backend logic (Edge Functions)
│   ├── auth.ts
│   ├── users.ts
│   ├── admin.ts
│   ├── coins.ts
│   ├── apps.ts
│   ├── forum.ts
│   └── audit.ts
│
├── /lib                # Shared logic
│   ├── jwt.ts
│   ├── crypto.ts
│   ├── rateLimit.ts
│   └── sanitize.ts
│
├── /storage            # KV-style storage abstraction
│   └── kv.ts
│
├── vercel.json
└── README.md

---

## 🧭 Development Philosophy

- Security first
- Server enforces all rules
- No trust in frontend
- Modular & auditable code
- Built to scale, not hack

---

## 🧠 Status

🟢 Phase 0 – Foundation  
⬜ Phase 1 – Auth & Users  
⬜ Phase 2 – Coin Economy  
⬜ Phase 3 – PaaS Engine  
⬜ Phase 4 – Community  
⬜ Phase 5 – UI & Motion

---

## 📜 License

TBD
