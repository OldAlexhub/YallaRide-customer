# YallaRide — Mobile App (yallaride-customer)

This folder contains the mobile customer app for Yalla — an Expo-based React Native application used by customers to request rides, track drivers, and manage profiles and trips.

The app uses Expo + expo-router, React Navigation, react-native-maps, socket.io-client, and OpenRouteService (ORS) for client-side routing/geometry when an API key is present.

This README explains how to set up the project for development, run on simulator/device, build and publish, and what environment variables the app uses.

---

## Quick facts

- Framework: Expo (managed workflow)
- Routing: expo-router
- Maps: react-native-maps
- Realtime: socket.io-client
- Language: JavaScript/TypeScript (TypeScript types present)

## Requirements

- Node.js 18+ recommended
- npm (or yarn/PNPM)
- Expo CLI (optional, but helpful for native testing):

```bash
npm install -g expo-cli
```

If you need to run on a simulator/emulator you'll need:
- Android Studio (for Android emulator) or Xcode (for iOS simulator on macOS)

## Install & run locally

1. Install dependencies

```bash
cd yallaride-customer
npm install
```

2. Run development server (Expo)

```bash
npm start
# Or to open directly on an emulator / device:
npm run android
npm run ios
npm run web
```

3. To run on a real device, install the Expo Go app on iOS/Android and scan the QR code shown by `npm start`.

## Environment variables and configuration

This project uses `react-native-dotenv` and expects environment variables to be defined in `.env` or `.env.local`. Example env keys that appear in the codebase:

- ORS_API_KEY — OpenRouteService API key. Several screens (trip routing/preview) call ORS directly to fetch route geometry/instructions when this key is present.
- REACT_NATIVE_CONFIG (if used) — app configuration; most API endpoints are called directly or via axios with base URLs defined in code.

If you plan to test routing UI locally, ensure you add a valid `ORS_API_KEY` to your `.env`.

## Key scripts

- start — launch Expo dev server
- android / ios / web — open app on those platforms via Expo
- reset-project — resets some caches / project state via `scripts/reset-project.js` (useful if you hit weird caching issues)
- lint — run expo lint

## Testing & linting

- The project uses ESLint (expo lint) — run `npm run lint`.
- The codebase doesn't currently include a test runner in package.json; if you want I can add unit tests and CI.

## Maps, Routing and ORS

Client-side code fetches routing geometry using OpenRouteService when `ORS_API_KEY` is present (examples in `src/screens/Trip/*`). This is a client-side convenience for showing route geometry; server-side routing is separate and configured independently.

If you need to remove ORS usage from the client or replace it with a different provider, I can help refactor the screens that import `ORS_API_KEY` from `@env`.

## Building and publishing

This project uses Expo-managed workflow. For publishing to the App Store / Play Store, consider:

1. Build with EAS or classic Expo build commands (EAS recommended):

```bash
# install EAS CLI
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

2. For classic builds (not recommended for production without EAS), you can run `expo build:android` or `expo build:ios` (older workflow).

3. Use `eas submit` or the Play/App store interfaces to publish the generated artifacts.

## Troubleshooting & tips

- If Metro caches cause problems, try clearing caches and resetting the project:

```bash
npm run reset-project
# or run expo start -c
```

- For map issues on Android devices: ensure Google Maps API key is configured when using react-native-maps.

## Where to look in the code

- App entry & routing: `index.js` and `app/` + `src/navigation` (expo-router usage)
- Routing & directions usage: `src/screens/Trip/*` (fetching ORS geometry)
- Storage & settings: `src/storage` and context files

## Next improvements I can help with

- Add automated tests + CI for builds
- Add EAS config and a GitHub Actions workflow to build and/or publish automatically
- Harden runtime environment handling for different environments (development/staging/production)

If you'd like the README expanded with build pipeline details or concrete examples for publishing with EAS, I can add those next.
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
