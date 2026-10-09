# Home Nader mobile app

Native Expo (React Native) app for https://home-nader.com/ (Nader Bakhoum, eXp Realty).

- **Home**: hero plus quick actions (call, WhatsApp, book a consultation)
- **Browse**: pick Residential / Commercial / Presales / Sold, then a city. The site page opens in the in-app browser (Safari View Controller on iPhone) with a Done button
- **Calculators**: the website's five Ratehub.ca widgets (payment, rate comparison table, affordability, CMHC, land transfer tax), loaded in a WebView with the same loader and keys as the site (`RATEHUB` in `src/config.js`). Each has a **Quick** tab with a built-in version (`src/calc.js`) as a backup
- **More**: guides, FAQ, blog, PDFs and a contact form (opens your mail app)

Site data (contact info, cities, URL patterns, colours) lives in `src/config.js`. Insurance and tax rules (CMHC tiers, BC transfer-tax thresholds, lender ratios) are constants in `src/calc.js`; update them when the rules change.

## Run it on your phone (testing)
1. `npm install`
2. `npx expo start`
3. Scan the QR code with **Expo Go**

Or paste `snack/App.js` into https://snack.expo.dev (single-file copy of the app).

## Build an installable app (EAS Build)
The project is configured for [Expo EAS Build](https://docs.expo.dev/build/introduction/) (`eas.json`).
You need a free account at https://expo.dev.

```
npm install
npm install -g eas-cli
eas login
eas init                                   # links the project to your Expo account
eas build --platform android --profile preview
```
The Android build finishes in the cloud (about 10-20 minutes) and gives you a download link for an
**.apk** file. Open the link on an Android phone and install it (allow "install unknown apps" when asked).

### iPhone (TestFlight)
Bundle ID `com.homenader.app`. Run these on a computer, in the project folder (the first run asks you to sign in with your Apple ID and a verification code):
iPhone apps can only be installed through Apple (TestFlight or the App Store), which needs an
**Apple Developer account ($99/year)**:
```
eas build --platform ios --profile production
eas submit --platform ios                  # uploads to App Store Connect / TestFlight
```

### App stores
- Google Play ($25 one time): `eas build --platform android --profile production`, then `eas submit --platform android`
- App Store: see the iPhone steps above

Without the terminal: in the Expo dashboard you can connect this GitHub repository to the project
and start builds from the web page (Builds > Create build).

## Notes
- Listings come from the site's Lofty/IDX pages (no public API), so listing pages open in the in-app browser rather than rebuilt natively.
- City URL patterns are confirmed for Burnaby only; check the other cities in `src/config.js`.
