# Apple iOS Production Readiness Checklist — BuyLow India
**Date**: October 2026  
**Application**: BuyLow Mobile (`BuyLow-app/buylow`)  
**Bundle Identifier**: `com.buylowindia.ecommerce`  
**Target OS**: iOS 16.0+  
**Build Tool**: Expo SDK 52 / React Native 0.76+ / Hermes Bytecode

---

## 1. App Store Guideline Compliance Audit

| App Store Guideline | Guideline Requirement | Implementation & Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Guideline 4.8** (Sign in with Apple) | Apps offering third-party social logins (e.g. Google) must provide Sign in with Apple as an equivalent option. | **Implemented & Compliant** | Apple Sign-In button displayed conditionally on iOS in both `login.tsx` and `register.tsx`. |
| **Guideline 5.1.1(v)** (Account Deletion) | Apps with account creation must initiate account deletion from within the app. | **Implemented & Compliant** | "Delete Account & Data" action wired in `app/(tabs)/account/index.tsx` with confirmation modal and `auth.deleteAccount` API call. |
| **Guideline 5.1.1** (Data Collection & Privacy) | Privacy description strings in `Info.plist` must clearly state why permissions are required. | **Implemented & Compliant** | Configured `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, and `NSPhotoLibraryAddUsageDescription` in `app.json`. |
| **Guideline 3.1.1** (Physical Goods & Services) | Physical goods e-commerce apps are exempt from Apple In-App Purchase (IAP) and must use standard payment gateways. | **Compliant** | Razorpay gateway + Cash on Delivery used exclusively for physical goods delivery. |
| **Export Compliance** | Non-exempt encryption disclosure | **Compliant** | `"ITSAppUsesNonExemptEncryption": false` configured in `app.json`. |
| **UPI App Query Schemes** | iOS 9+ restricts `canOpenURL` unless schemes are declared in `LSApplicationQueriesSchemes`. | **Implemented & Compliant** | Declared `upi`, `tez`, `phonepe`, `paytmmp`, `credpay`, `bhim`, `mobikwik`, `amazonpay` in `app.json`. |
| **Safe Area Insets** | Prevent UI clipping on iPhone Dynamic Island and Home Indicator. | **Implemented & Compliant** | `SafeAreaView` from `react-native-safe-area-context` wraps all screens. |
| **Hermes Bytecode Bundle** | Production iOS Hermes package generation | **Verified** | `npx expo export` successfully generated `entry-f2a326c324f3cda724c22eb0a257bc75.hbc` (4.85 MB). |

---

## 2. Command to Generate iOS Production Release / TestFlight Build
To build the signed iOS archive (IPA) for App Store / TestFlight distribution:
```bash
cd BuyLow-app/buylow
npx eas-cli build --platform ios --profile production
```
*Note: Ensure Apple Developer Team ID and App Store Connect Distribution Certificates are provisioned in EAS Credentials prior to submission.*
