# Technical Handoff

## Verified dependency baseline
Read `package.json` and `package-lock.json` as the source of truth. At handoff, key dependencies include:

- Expo `~57.0.21`
- React `19.2.3`
- React Native `0.86.3`
- react-native-maps `1.27.2`
- expo-location `~57.0.16`
- react-native-webview `13.16.1`

## Setup

```bash
npm ci
npx expo start
```

On Windows PowerShell, if execution policy blocks the `npx` PowerShell script, use:

```text
npx.cmd expo start
```

## Environment
Create `.env` from `.env.example` and obtain the real `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` securely from the owner. Do not commit the real key to source control.

## Architecture note
The current prototype intentionally grew quickly and contains substantial screen/state logic in the main app code. Establish the inherited baseline first, then refactor gradually. A production version should move toward proper navigation, reusable components, typed domain models, an API/service layer, backend persistence, real-time ride state, secure configuration, and automated testing.

## Recommended engineering sequence
1. Commit the inherited working baseline.
2. Verify Customer and Driver flows.
3. Add source control hygiene and environment handling.
4. Refactor screens/components incrementally.
5. Implement backend/auth/data models.
6. Implement production pricing/dispatch/payments.
7. Implement live trip/location lifecycle.
8. Add notifications, admin operations, testing, monitoring, builds, and store release workflows.

## Product constraint
Do not rewrite or redesign approved areas without owner approval. The existing app is the working blueprint.
