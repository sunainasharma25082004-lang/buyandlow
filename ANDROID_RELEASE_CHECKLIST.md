# Android Production Release Checklist — BuyLow India
**Date**: October 2026  
**Application**: BuyLow Mobile (`BuyLow-app/buylow`)  
**Package Name**: `com.buylowindia.ecommerce`  
**Target SDK**: Android 14+ (API 34+)  
**Build Tool**: Expo SDK 52 / React Native 0.76+ / Hermes Bytecode

---

## 1. Release Readiness Audit

| Verification Item | Requirement | Implementation Status | Evidence / Test Result |
| :--- | :--- | :---: | :--- |
| **Package Identifier** | Must be unique reverse domain name | Verified | `"package": "com.buylowindia.ecommerce"` in `app.json` |
| **App Name & Branding** | Correct branding, display name, adaptive icon | Verified | Name: `BuyLow`, adaptive icon foreground: `./assets/images/icon.png`, background: `#ffffff` |
| **Permissions Audit** | Only required runtime permissions declared | Verified | `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` with user-facing rationale strings |
| **Edge-to-Edge Support** | Google Play Android 15 compatibility | Verified | `"edgeToEdgeEnabled": true` configured in `app.json` |
| **Soft Keyboard Handling** | Avoid viewport jumping | Verified | `"softwareKeyboardLayoutMode": "resize"` |
| **Hermes Bytecode Compilation** | Fast app startup and memory efficiency | Verified | `npx expo export` successfully generated `entry-e70b4586928561311938bfea4c95ce50.hbc` (4.85 MB) |
| **Expo Diagnostics** | Zero configuration mismatches | Verified | `npx expo-doctor` passed 18/18 checks with code 0 |
| **TypeScript Compilation** | Strict type safety | Verified | `npx tsc --noEmit` passed with 0 errors |
| **ESLint Validation** | Code quality & formatting | Verified | `expo lint` passed with 0 problems, 0 errors, 0 warnings |
| **EAS Account Match** | Cloud build and signing authority | Verified | Account `viz_eas_001` (Team: `vizeas001s-team`) matches project ID `0d15cbe2-7d31-41e7-b1f4-b5c3283eefc3` |
| **Deep Links & Schemes** | Support external payment redirect | Verified | `scheme: "buylow"` registered for app deep-linking |

---

## 2. Command to Generate Android Production Release AAB
To build the signed Google Play Android App Bundle (AAB):
```bash
cd BuyLow-app/buylow
npx eas-cli build --platform android --profile production
```
*Note: Ensure Google Play Keystore is configured in EAS Credentials before triggering cloud build.*
