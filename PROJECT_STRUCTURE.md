# Clean Project Structure (Vercel + Supabase Only)

## 🚀 USED BY VERCEL DEPLOYMENT:

### Frontend (React App)
- `frontend/` - Complete React application
- `frontend/src/components/` - All UI components
- `frontend/package.json` - Frontend dependencies

### API (Serverless Functions)
- `api/` - Vercel serverless functions
- `api/bookings.js` - Main booking endpoint
- `api/check-availability.js` - Availability checking
- `api/create-order.js` - Payment processing
- `api/validate-coupon.js` - Coupon validation

### Shared
- `lib/supabase.js` - Supabase client & conflict detection
- `vercel.json` - Vercel deployment configuration
- `.env.local` - Environment variables (Supabase credentials)

### iOS Admin App
- `NIYAT/` - Complete iOS app for admin booking management

## 🗑️ REMOVED (Were Causing Confusion):
- `backend/` - Railway Express server (unused)
- Root level duplicates - `src/`, `dist/`, `package.json`, etc.
- Test files - `test-*.js`, `debug-*.js`, `*.db`
- Setup docs - `DEPLOY.md`, `GOOGLE_SETUP.md`, etc.

## 🎯 DEPLOYMENT:
- **Frontend + API**: Vercel (single deployment)
- **Database**: Supabase
- **iOS App**: Local development

This clean structure ensures Vercel deployments work reliably without confusion from unused code.