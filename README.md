# RoR2 Handbook

- [Google Play](https://play.google.com/store/apps/details?id=com.ror2handbook)
- [App Store](https://apps.apple.com/us/app/ror2-handbook/id1528143765)

## Testing

Before shipping a new build,

- Verify Survivors open (see challenge vs Challenge bug)
- Verify no empty item icons
- Verify filtering for items works
- Verify searching for items works
- Verify detail popup works for a complex item

## Deployment

1. `git commit -m 'increment build number'`
   See previous increment build number commits

### iOS

1. Archive for iOS in XCode (target must be real device)
1. Wait for Processing for build
1. Manage Compliance in Testflight
1. Submit for Review

### Android

[Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)

## Useful links

- [Testflight](https://appstoreconnect.apple.com/apps/1528143765/testflight/ios)
- [Play Store Console](https://play.google.com/console/u/0/developers/5395627262443487462/app/4974282771374430241/app-dashboard?timespan=thirtyDays&showKpiMenu=null)

- [App Store analytics](https://appstoreconnect.apple.com/analytics/app/d30/1528143765/overview)
- [Play Store analytics](https://play.google.com/console/u/0/developers/5395627262443487462/app/4974282771374430241/statistics?metrics=ACTIVE_USERS-ALL-UNIQUE-PER_INTERVAL-DAY&dimension=COUNTRY&dimensionValues=OVERALL%2CUS%2CGB%2CCA%2CRU&dateRange=2021_3_6-2021_4_4&growthRateDimensionValue=OVERALL&tab=APP_STATISTICS&ctpMetric=DAU_MAU-ACQUISITION_UNSPECIFIED-COUNT_UNSPECIFIED-CALCULATION_UNSPECIFIED-DAY&ctpDateRange=2021_3_6-2021_4_4&ctpDimension=COUNTRY&ctpDimensionValue=OVERALL&ctpPeersetKey=3%3A7098e2ceb59ccf42)
- [Firebase dashboard](https://console.firebase.google.com/u/5/project/ror2-handbook/overview)
