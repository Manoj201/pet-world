# Pet World

Your Pet's Life Partner — a pet supply storefront with guest/account checkout, WhatsApp order
notifications, order tracking, and an admin panel for products, orders, and inventory.

## Stack

- **Frontend:** React + TypeScript + Vite, Tailwind v4, shadcn/ui (Base UI), Zustand, React Router
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Hosting:** Vercel (frontend), Firebase (rules/functions via GitHub Actions)

## Local development

```bash
yarn install
cp .env.example .env.local   # fill in Firebase config, WhatsApp number, Maps embed key
yarn dev
```

## Scripts

- `yarn dev` — start the Vite dev server
- `yarn build` — typecheck + production build
- `yarn lint` — ESLint

## Project structure

```
src/
  pages/            # routed pages, admin/ subfolder for the admin panel
  components/       # shared components; components/ui/ is shadcn-generated
  services/         # Firebase-backed data access (products, orders, storage, inventory)
  store/            # Zustand stores (cart, auth)
  utils/            # small helpers (WhatsApp link builder)
functions/          # Cloud Functions (stock transactions, order tracking, admin claims)
firestore.rules, storage.rules, firestore.indexes.json
```

## Deployment

- **Frontend:** push to `main` → Vercel auto-deploys (configured via Vercel's GitHub integration)
- **Backend:** push to `main` → `.github/workflows/firebase-deploy.yml` deploys Firestore
  rules/indexes and Cloud Functions, using a GCP service account stored in the
  `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID` GitHub secrets

## Environment variables

See `.env.example`. All are `VITE_`-prefixed and safe to expose client-side (Firebase web config
is meant to be public; the Google Maps key is restricted to the Maps Embed API and specific
domains in Google Cloud Console).
