# Home Nader mobile app

Native Expo (React Native) app for https://home-nader.com/ (Nader Bakhoum, eXp Realty).

- **Home**: hero plus quick actions (call, WhatsApp, book a consultation)
- **Browse**: pick Residential / Commercial / Presales / Sold, then a city. The site page opens in the in-app browser (Safari View Controller on iPhone) with a Done button
- **Calculator**: native mortgage payment calculator (Canadian semi-annual compounding)
- **More**: guides, FAQ, blog, PDFs and a contact form (opens your mail app)

Site data lives in `src/config.js` (contact info, cities, URL patterns, colours).

## Run it on your phone
1. `npm install`
2. `npx expo start`
3. Scan the QR code with **Expo Go**

## Build store apps
```
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```
iOS needs an Apple Developer account ($99/yr), Android a Google Play account ($25 once).

## Notes
- Listings come from the site's Lofty/IDX pages (no public API), so listing pages open in the in-app browser rather than rebuilt natively.
- City URL patterns are confirmed for Burnaby only; check the other cities in `src/config.js`.
