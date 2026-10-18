# Mortgage Calculator

Expo app for the home-nader.com mortgage calculators page: mortgage payment (with payment frequency, CMHC premium, 5-year term balance), affordability (stress test, GDS/TDS) and CMHC insurance.

```
npm install
npx expo start   # scan with Expo Go
npm test         # unit tests for the mortgage maths
```
Estimates only; confirm figures with your lender.

## Web version
`web/mortgage-calculator/` is a no-install web app (PWA) with the same features, deployed by `.github/workflows/pages.yml` to https://nbakhoum84.github.io/mytest/mortgage-calculator/. `site-snippet/mortgage-calculator-embed.html` puts the live calculator on the Lofty page and `site-snippet/mortgage-calculator-page-script.js` adds the "Get the Mortgage Calculator app" card.
