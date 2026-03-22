# Supabase OAuth Setup for falah.live

If sign-in is stuck at `https://falah.live/auth/callback#` (empty hash), the **Supabase redirect URL is not configured correctly**.

## Required Configuration

### 1. Open Supabase Dashboard
Go to: **https://supabase.com/dashboard** → Select project `jihbvsjgxzovyskmgfgr`

### 2. Authentication → URL Configuration
Navigate to: **Authentication** → **URL Configuration**

### 3. Set These Values

| Setting | Value |
|---------|-------|
| **Site URL** | `https://falah.live` |
| **Redirect URLs** | Add these (one per line): |
| | `https://falah.live/**` |
| | `https://falah.live/auth/callback` |
| | `http://localhost:3006/auth/callback` (for dev) |

### 4. Save
Click **Save** and wait a few seconds for changes to apply.

### 5. Verify Google OAuth (if using Google)
- **Authentication** → **Providers** → **Google**
- Ensure Google OAuth is enabled
- The **Callback URL** shown there (for Google Cloud Console) should be:
  ```
  https://jihbvsjgxzovyskmgfgr.supabase.co/auth/v1/callback
  ```
- In **Google Cloud Console** → APIs & Services → Credentials → Your OAuth 2.0 Client:
  - **Authorized redirect URIs** must include: `https://jihbvsjgxzovyskmgfgr.supabase.co/auth/v1/callback`

## Why This Matters

When you click "Sign in with Google":
1. You go to Supabase → Google → back to Supabase
2. Supabase redirects to your **Redirect URL** with tokens in the hash: `https://falah.live/auth/callback#access_token=...`
3. If `https://falah.live/auth/callback` is **not** in Redirect URLs, Supabase may redirect without tokens or to the wrong URL
4. Result: you land at `auth/callback#` with an empty hash = stuck

## After Fixing

1. Clear browser cache or use incognito
2. Try sign-in again
3. You should land at `auth/callback#access_token=...` (with tokens) and be redirected to `/profile` within 1–2 seconds
