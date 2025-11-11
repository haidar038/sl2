# Domain Setup Guide for sl2.my.id

This guide explains how to configure your ShortLink URL shortener to work with your custom domain `sl2.my.id`.

## Architecture Overview

ShortLink uses a dual-layer architecture:

1. **Frontend React App** - Handles the dashboard, authentication, and URL management UI
2. **Supabase Edge Function** - Handles the actual URL redirection and analytics tracking

## Domain Configuration

### Current Configuration

- **Domain**: `sl2.my.id`
- **Short URL Format**: `https://sl2.my.id/{slug}`
- **Edge Function**: `supabase/functions/redirect/index.ts`

### Environment Variables

The `.env` file contains the following configuration:

```env
VITE_APP_DOMAIN="sl2.my.id"
```

This variable is used throughout the application to:
- Display the correct domain in the CreateUrlDialog form
- Generate proper short URLs in UrlCard components
- Set meta tags in index.html

## Supabase Setup

### 1. Deploy the Edge Function

First, ensure the redirect Edge Function is deployed to Supabase:

```bash
npx supabase functions deploy redirect
```

This will deploy the function to:
```
https://{PROJECT_REF}.supabase.co/functions/v1/redirect/{slug}
```

### 2. Custom Domain Configuration

You have **two options** for routing traffic:

#### Option A: Direct Domain Routing (Recommended)

Configure your domain DNS and Supabase to route all short URL requests directly to the Edge Function.

**DNS Configuration:**
1. Point `sl2.my.id` to your Supabase project
2. Set up an A or CNAME record as provided by Supabase

**Supabase Configuration:**
1. Go to **Project Settings** → **Custom Domains** in Supabase Dashboard
2. Add `sl2.my.id` as a custom domain
3. Follow Supabase's verification steps
4. Configure routing rules to send unknown paths to the `redirect` Edge Function

**Routing Logic:**
- `/` → React App (Index page)
- `/auth` → React App (Auth page)
- `/dashboard` → React App (Dashboard page)
- `/{slug}` → Edge Function (Redirect)

#### Option B: Subdomain for Redirects

Use a separate subdomain for short URLs:

1. Update `.env`:
   ```env
   VITE_APP_DOMAIN="go.sl2.my.id"
   ```

2. Configure DNS:
   - Point `sl2.my.id` to your frontend hosting
   - Point `go.sl2.my.id` to Supabase Edge Functions

3. Update meta tags in `index.html` to use `sl2.my.id` for the main site

**Short URL Format**: `https://go.sl2.my.id/{slug}`

### 3. Environment Variables in Supabase

Ensure your Supabase Edge Function has access to these environment variables (automatically provided by Supabase):

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

These are automatically injected into Edge Functions by Supabase.

## How URL Redirection Works

1. User clicks short URL: `https://sl2.my.id/abc123`
2. Request hits the Edge Function at `redirect/abc123`
3. Edge Function:
   - Looks up `abc123` slug in the `urls` table
   - Checks if URL is deleted or expired
   - Extracts analytics data (IP, user agent, referrer, geo data)
   - Hashes the IP address (SHA-256) for privacy
   - Returns a 302 redirect to the target URL
   - Asynchronously logs the click and increments counter (non-blocking)
4. User is redirected to the destination URL

## Testing the Setup

### Local Development

During development, the app runs on `localhost:8080`. The short URLs will use:
```
http://localhost:8080/{slug}
```

To test the Edge Function locally:
```bash
npx supabase functions serve redirect
```

### Production Testing

1. Create a test short URL in the dashboard
2. Copy the generated short URL (e.g., `https://sl2.my.id/test123`)
3. Visit the URL in a browser
4. Verify:
   - You are redirected to the target URL
   - Click count increments in the dashboard
   - Analytics data is captured

## Troubleshooting

### Issue: Short URLs return 404

**Cause**: Domain routing is not properly configured

**Solution**:
- Verify the Edge Function is deployed
- Check Supabase custom domain settings
- Ensure DNS records are correct
- Check that routing rules prioritize Edge Function for unknown paths

### Issue: Analytics not tracking

**Cause**: Edge Function permissions or database RLS policies

**Solution**:
- Verify the Edge Function is using the service role key
- Check RLS policies on `urls` and `clicks` tables
- Review Edge Function logs in Supabase Dashboard

### Issue: Wrong domain in short URLs

**Cause**: `VITE_APP_DOMAIN` environment variable not set

**Solution**:
- Update `.env` file with correct domain
- Rebuild the application: `npm run build`
- Restart dev server: `npm run dev`

## Meta Tags and Favicon Configuration

The application is now configured with:

### Favicon Files
- `/favicon.ico` - Standard favicon
- `/favicon.svg` - Modern SVG favicon
- `/favicon-96x96.png` - 96x96 PNG favicon
- `/apple-touch-icon.png` - Apple device icon
- `/web-app-manifest-192x192.png` - PWA icon (192x192)
- `/web-app-manifest-512x512.png` - PWA icon (512x512)

### Meta Tags
- Theme color: `#000000` (black)
- Open Graph tags with `sl2.my.id` domain
- Twitter Card tags with proper images
- Web App Manifest linked

All meta tags in `index.html` are configured with the `sl2.my.id` domain and will work correctly once the domain is live.

## Next Steps

1. **Deploy the Edge Function** to Supabase
2. **Configure custom domain** in Supabase Dashboard
3. **Update DNS records** for sl2.my.id
4. **Test the setup** with a sample short URL
5. **Monitor Edge Function logs** for any errors

## Support

For Supabase-specific configuration help, refer to:
- [Supabase Custom Domains Documentation](https://supabase.com/docs/guides/platform/custom-domains)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)

For project-specific issues, check the main `README.md` and `CLAUDE.md` files.
