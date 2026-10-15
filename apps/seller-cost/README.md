# Seller Cost

Expo app: BC home-seller cost estimator (realtor commission, GST, legal, prep, mortgage payout and prepayment penalty) showing your estimated net proceeds, plus a seller checklist.

```
npm install
npx expo start   # scan with Expo Go
npm test         # unit tests for the cost maths
```
Estimates only. Commission defaults to 7% of the first $100,000 and 3% of the balance; adjust the rates to match your listing agreement. Confirm figures with your realtor and lawyer.

## Web version
`web/seller-cost/` is a no-install web app (PWA) with the same features, deployed by `.github/workflows/pages.yml` along with the other web apps.
