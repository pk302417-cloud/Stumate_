# Launch Checklist

## Pre-Launch

### Application
- [x] Landing page with value proposition
- [x] Email/password authentication
- [x] OTP verification flow
- [x] Onboarding (name, hostel, graduation year, WhatsApp, consent)
- [x] Terms acceptance with version tracking
- [x] Marketplace home with category browse
- [x] Search with filters (price, condition, hostel, category)
- [x] Listing detail page with image gallery
- [x] Sell/Create listing with image upload + compression
- [x] Edit listing
- [x] My Listings management (edit, renew, delete)
- [x] Favorites (local storage in mock mode)
- [x] Chat/messaging between buyer and seller
- [x] Profile page with edit
- [x] Admin console (dashboard, reports, user management, data requests)
- [x] Banned user screen
- [x] 404 page

### Legal Pages (placeholders)
- [ ] Terms of Service — full draft
- [ ] Privacy Policy — full draft
- [ ] Community Guidelines — full draft
- [ ] Safety Tips — full draft
- [ ] Grievance Redressal — form + officer details
- [ ] Cookie & Local Storage Notice — full draft
- [ ] About page — content
- [ ] Contact page — content
- [ ] FAQ — content

### Technical
- [x] TypeScript with no errors
- [x] Production build succeeds
- [x] Route-based code splitting
- [x] Vendor chunk splitting
- [x] PWA manifest
- [x] robots.txt + sitemap.xml
- [x] SEO meta tags (Open Graph, Twitter Card)
- [x] Theme color meta
- [x] Test suite (29 tests passing)
- [x] Error boundary
- [x] Loading states (skeletons)
- [x] Empty states
- [x] Error states with retry
- [x] Toast notifications
- [x] Responsive design (mobile to desktop)
- [x] Dark mode support
- [x] Accessibility: semantic HTML, ARIA labels, keyboard navigation

### Security
- [ ] RLS policies on all tables (see DB_CHANGE_REQUESTS.md)
- [ ] Storage bucket policies
- [ ] Admin role column protection
- [ ] Rate limiting on auth endpoints
- [ ] Content moderation for listings

### Performance
- [x] Code splitting (lazy routes)
- [x] Manual vendor chunks
- [x] Image compression on upload
- [x] React Query caching (30s stale time)
- [ ] Lighthouse audit
- [ ] Bundle size analysis

### Documentation
- [x] README
- [x] Architecture docs
- [x] Security docs
- [x] Testing docs
- [x] Deployment guide
- [x] DB change requests
- [x] Launch checklist (this file)

## Post-Launch
- [ ] Monitor error rates
- [ ] Set up analytics
- [ ] Collect user feedback
- [ ] Plan Phase 2 features (real-time chat, push notifications, ratings)
