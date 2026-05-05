# RiskPilot — Complete Code Review & Fixes

## 📋 Executive Summary

**RiskPilot** is a production-ready SaaS platform for XAUUSD (Gold) traders with:
- Multi-tier subscription model (FREE → PRO → PRO_PLUS → ELITE)
- Real-time Supabase integration with JWT authentication
- Payment processing via Paystack
- Admin dashboard for user management
- Vercel deployment with automated cron jobs

---

## ✅ What Was Fixed

### 1. **api/admin/force-upgrade.js** — Missing Supabase Import (CRITICAL)
**Error:** `ReferenceError: supabase is not defined`

```javascript
// BEFORE (broken)
const { error } = await supabase.from("profiles").update({ plan }).eq("email", email);

// AFTER (fixed)
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// With validation
if (!email || !plan) {
  return res.status(400).json({ error: "Missing email or plan" });
}
```

**Impact:** Admin force upgrades now work correctly.

---

### 2. **api/cron/expire-subscriptions.js** — Silent Failures (HIGH)
**Problem:** Loop continues if individual user updates fail—no error tracking.

```javascript
// BEFORE (silent failures)
for (const user of users || []) {
  await supabase.from("profiles").update({ plan: "FREE" }).eq("id", user.id);
  // ❌ No error check!
}

// AFTER (error tracking)
const failed = [];
for (const user of users || []) {
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ plan: "FREE", is_gold: false, updated_at: now })
    .eq("id", user.id);

  if (updateError) {
    console.error(`Failed to downgrade user ${user.id}:`, updateError);
    failed.push({ user_id: user.id, email: user.email, error: updateError.message });
  } else {
    downgraded++;
  }
}

return res.json({
  success: true,
  downgraded,
  failed: failed.length > 0 ? failed : undefined,
});
```

**Impact:** Failed subscription downgrades now visible in logs and API response.

---

### 3. **api/paystack/webhook.js** — Missing Error Boundaries (HIGH)
**Problem:** Transaction and ledger failures would crash the webhook.

```javascript
// AFTER (safe error handling)
try {
  await recordTransaction({...});
} catch (txnError) {
  console.error(`Transaction recording failed:`, txnError);
  // Webhook continues, logs captured
}

try {
  await writeLedger({...});
} catch (ledgerError) {
  console.error(`Ledger write failed:`, ledgerError);
  // Webhook continues, logs captured
}

// Added detailed error responses
if (profileError) {
  return res.status(500).json({ 
    error: "PROFILE_FETCH_FAILED",
    details: profileError.message 
  });
}
```

**Impact:** Webhook won't crash on transaction/ledger failures.

---

### 4. **App.jsx** — Missing `/upgrade` Route (MEDIUM)
**Problem:** `PlanRoute` redirects to `/upgrade` but route doesn't exist → 404.

```javascript
// AFTER (added upgrade route)
import UpgradePlans from "./components/UpgradePlans";

<Route path="/upgrade" element={<UpgradePlans />} />
```

**Impact:** Users now see upgrade page when accessing pro features without plan.

---

### 5. **api/middleware/auth.js** — Missing Error Logging (LOW)
**Added:** Console error logging for debugging

```javascript
catch (err) {
  console.error("[Auth Middleware] Error:", err);
  return res.status(500).json({...});
}
```

---

### 6. **api/middleware/requirePlan.js** — Weak Error Response (LOW)
**Added:** Return current plan info in error response

```javascript
if (rank[userPlan] < rank[plan]) {
  return res.status(403).json({
    error: "Upgrade required",
    required: plan,        // ← NEW
    current: userPlan,     // ← NEW
  });
}
```

---

## 🏗️ Architecture Overview

```
Frontend (React 19 + Vite + Router v7)
├── Landing Page (Public)
├── Login (Supabase Auth)
├── Dashboard (Protected)
├── Calculator (Plan-gated)
├── Journal (Pro+)
├── Upgrade Modal (Plan upsell)
└── Admin Panel (Role-gated)

Backend APIs (Vercel Serverless)
├── /api/admin/* (Admin operations)
├── /api/middleware/* (Auth/Plan checks)
├── /api/paystack/* (Payment webhooks)
├── /api/cron/* (Daily jobs)
└── All secured with JWT + env vars

Database (Supabase PostgreSQL)
├── profiles (user accounts, plans, subscriptions)
├── transactions (payment history)
├── ledger (audit trail)
└── Row-level security (RLS) for data isolation

Monitoring
├── Vercel Analytics (user behavior)
├── Vercel Speed Insights (performance)
└── Console logging (errors & events)
```

---

## 🔐 Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| JWT Authentication | ✅ | Supabase handles signing & verification |
| Row-Level Security | ✅ | `profiles` table isolated by user ID |
| Password Hashing | ✅ | Supabase auth (bcrypt) |
| API Keys | ✅ | Service role key used server-side only |
| Webhook Signature | ✅ | HMAC-SHA512 from Paystack |
| HTTPS/TLS | ✅ | Vercel enforces |
| Rate Limiting | ⚠️ | Recommend: add to admin & webhook endpoints |
| CORS | ✅ | Handled by Vercel |

---

## 📊 Plan Hierarchy

```
FREE (0)
  ↓
PRO (1) — Advanced Risk Tools
  ↓
PRO_PLUS (2) — Journal AI, Signal alerts
  ↓
ELITE (3) — Everything + Premium support
```

Logic in `src/lib/requirePlan.js`:
```javascript
const rank = { FREE: 0, PRO: 1, PRO_PLUS: 2, ELITE: 3 };
return rank[userPlan] >= rank[requiredPlan];
```

---

## 💳 Payment Flow

```
1. User clicks Upgrade → UpgradePlans component
2. Paystack button initialized with reference (pro, pro_plus, elite)
3. User pays via Paystack
4. Webhook sent to /api/paystack/webhook.js
5. Signature verified (HMAC-SHA512)
6. Profile plan updated + subscription_end set
7. Transaction recorded + ledger written
8. Frontend polls refreshProfile() → plan updates realtime via Supabase
9. UI re-renders (isPro, isProPlus, isElite flags update)
```

---

## 🔄 Subscription Expiration

**Vercel Cron** runs `/api/cron/expire-subscriptions.js` daily:

```
1. Find all users where plan != FREE AND subscription_end < now()
2. For each user:
   - Update plan → FREE
   - Update is_gold → false
3. Return count of downgraded users
4. Failed updates tracked & logged
```

Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/expire-subscriptions",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 📝 Deployment Checklist

- [ ] All env vars set in Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `ADMIN_SECRET`
- [ ] Supabase RLS policies enabled
- [ ] Supabase Realtime enabled on `profiles` table
- [ ] Paystack webhook URL configured: `https://your-domain/api/paystack/webhook`
- [ ] Vercel cron job scheduled
- [ ] Analytics & Speed Insights enabled
- [ ] Privacy policy & Terms updated
- [ ] Testing: Test payment flow with Paystack test keys
- [ ] Testing: Test admin force-upgrade endpoint
- [ ] Testing: Verify cron runs daily

---

## 🚀 Next Steps / Recommendations

### High Priority
1. **Rate limiting** on admin & webhook endpoints
2. **Email notifications** (welcome, payment, upgrade, expiry)
3. **Manual refund flow** for support team
4. **Database backups** scheduled daily

### Medium Priority
1. **Activity logging** (who logged in, who upgraded, etc.)
2. **Metrics dashboard** (MRR, churn rate, CAC)
3. **Error tracking** (Sentry or similar)
4. **Performance monitoring** (slow query logs)

### Nice to Have
1. **Referral/affiliate system** (in progress: `src/pages/Affiliate.jsx`)
2. **Email templates** (SendGrid or Resend)
3. **Mobile app** (using Capacitor, already configured)
4. **Admin API documentation** (OpenAPI/Swagger)

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/context/AuthContext.jsx` | Global auth state, profile fetching, realtime updates |
| `src/lib/supabaseClient.js` | Supabase client initialization with env guards |
| `src/lib/requirePlan.js` | Plan ranking & validation logic (single source of truth) |
| `src/components/ProtectedRoute.jsx` | Route guard: must be logged in |
| `src/components/PlanRoute.jsx` | Route guard: must have min plan |
| `src/components/RoleRoute.jsx` | Route guard: must have role (admin) |
| `api/admin/force-upgrade.js` | Admin endpoint: manual plan changes |
| `api/admin/users.js` | Admin endpoint: list all users |
| `api/paystack/webhook.js` | Webhook: handle payment confirmations |
| `api/cron/expire-subscriptions.js` | Cron: downgrade expired subscriptions |
| `api/middleware/auth.js` | Middleware: verify JWT tokens |
| `api/middleware/requirePlan.js` | Middleware: check plan access |

---

## 🧪 Testing Paystack Integration

**Paystack Test Mode:**
```javascript
// Use test key in .env.local
PAYSTACK_SECRET_KEY=sk_test_...

// Test card: 4084084084084081 (any expiry, any CVV)
// Status: Check Paystack dashboard for webhook delivery
```

---

## 📞 Support & Contacts

- **Email:** support@riskpilot.app
- **Location:** Lagos, Nigeria
- **Docs:** https://riskpilot-coral.vercel.app
- **Status:** Production ready

---

**Last Updated:** 2026-05-05  
**Fixed By:** Darkhearted007  
**Version:** 1.1.0 (post-fixes)
