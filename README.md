# Home Nader mobile app

Expo (React Native) app that shows https://home-nader.com/ in a native shell
with back navigation, pull-to-refresh, an offline/error screen, and external
links opening in the system browser.

## Run it on your phone
1. Install Node.js, then run `npm install`
2. Run `npx expo start`
3. Install **Expo Go** on your phone and scan the QR code

## Build store apps
```
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```
iOS needs an Apple Developer account ($99/yr), Android a Google Play account ($25 once).

To change the site, edit `SITE_URL` and `SITE_HOST` in `App.js`.
