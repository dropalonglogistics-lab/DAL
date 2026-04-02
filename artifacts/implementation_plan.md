# Core UX Additions & Legal Framework Implementation

This plan covers resolving the multi-faceted UX and compliance tickets, including building out legal documentation, managing cookie consent, setting up a 3-step onboarding wizard, integrating a 404 error boundary, and laying the groundwork for the referral program.

## User Review Required

> [!WARNING]
> **Database Schema Updates Needed**
> Because I do not currently have direct access to your Supabase Management API to execute raw schema changes automatically, you will need to run the following script manually in your Supabase Dashboard SQL Editor, *or* provide me with an active token to run it for you using the database tools.

**SQL Migration Script (`add_core_ux_fields.sql`):**
```sql
-- Add onboarding state and referral fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Generate referral codes for existing users
UPDATE profiles SET referral_code = SUBSTRING(MD5(id::text) FROM 1 FOR 8) WHERE referral_code IS NULL;

-- Automatically generate referral codes for new profiles
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON profiles;
CREATE TRIGGER trigger_generate_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_referral_code();
```

## Proposed Changes

---

### Navigation & Error Boundaries
#### [MODIFY] `src/app/layout.tsx`
- Mount the global `<CookieConsentBanner />` here so it attaches to every routed page.

#### [NEW] `src/app/not-found.tsx`
- Implement a branded 404 page ("Looks like this route doesn't exist.") featuring the Gold Syne font aesthetic and navigation buttons connecting to Home and Search.

---

### Compliance & Legal Structure (PublicLayout)
#### [NEW] `src/components/legal/CookieBanner.tsx`
- Fixed-bottom notification querying `localStorage` for `dal_cookie_consent`. 
- Provides the "Accept All" (gold) and "Essential Only" (ghost) options without blocking interactions.

#### [NEW] `src/app/legal/layout.tsx`
- Wrap legal pages within the clean document layout (`PublicLayout`) featuring a sidebar TOC on desktop platforms.

#### [NEW] `src/app/legal/terms/page.tsx` (Terms of Service)
- Formal platform usage terms, personal shopper commitments, and standard Nigerian governing law sections.

#### [NEW] `src/app/legal/privacy/page.tsx` (Privacy Policy)
- Focus heavily on NDPR compliance structures, third-party handshakes, and user rights.

#### [NEW] `src/app/legal/cookies/page.tsx` (Cookie Policy)
- Provide a responsive 3-category table explaining Essential, Analytics, and Preference cookies.

---

### Onboarding Flow
#### [MODIFY] `src/app/welcome/page.tsx`
- Evolve the route into a full-screen, 3-step wizard with local step-state (`step=1 | 2 | 3`).
- **Step 1:** Dynamic animated PH CSS illustration greeting.
- **Step 2:** Miniature Search Widget demonstration.
- **Step 3:** Final points-earning overview and Dashboard transfer.
- Push state update for `onboarding_completed = true` directly to `profiles` on completion.

#### [MODIFY] `src/app/profile/ProfileView.tsx` (or Auth Redirectors)
- Add conditional routing when fetching the user's profile: if `onboarding_completed === false`, softly redirect the user to `/welcome` to ensure they finish it.

---

### Referral Intelligence
#### [NEW] `src/app/invite/[code]/page.tsx`
- Create a customized landing hub mapping back to the referrer's actual name querying the `profiles` table.
- Attach a CTA directing to `/auth/register?ref=[CODE]`.

#### [MODIFY] `src/app/auth/register/RegisterForm.tsx`
- Query the `ref` parameter via `useSearchParams()`.
- Add an optional "Referral Code" text field preloaded with the query hash.
- Insert the recorded referral code onto the `profiles` row during sign up securely.

## Open Questions

> [!IMPORTANT]
> **First Order Verification trigger:** You requested that we "check referral_code_used on order creation, award via /api/points/award". Since DAL processes different kinds of orders across Shopper, Express, and Routing features individually, should I just design a unified helper function (`awardReferralBonus(userId)`) that you can plug into your various checkout action controllers?

## Verification Plan

### Automated/Manual Verification
- Fully verify visual 404 mapping during manual exploration.
- Attempt an incognito visit to check the Cookie Banner intercept and Storage state.
- Create an account manually, ensuring the DB sets `referral_code` and that the redirect to `/welcome` completes successfully, locking out repeats on completion.
