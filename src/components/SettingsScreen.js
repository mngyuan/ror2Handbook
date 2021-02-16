import React, {useContext} from 'react';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/Ionicons';
import analytics from '@react-native-firebase/analytics';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {
  ANDROID_PACKAGE_NAME,
  Colors,
  FontStyles,
  FontSize,
  IOS_APP_ID,
} from '../const.js';
import {RText} from '../ui.js';

const SUPPORT_EMAIL = 'support@mngyuan.com';
const SUPPORT_EMAIL_SUBJECT = 'Help with RoR2 Handbook';
const SUPPORT_EMAIL_BODY = 'Describe your problem';
const SHARE_URL = 'https://ror2handbook.app';
const DONATE_URL = 'https://buymeacoffee.com/mngyuan';

const SettingsScreen = ({navigation}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData, setAsyncStorageItem} = useContext(
    AsyncStorageContext,
  );

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  const versionString = `Version: ${DeviceInfo.getVersion()} Build: ${DeviceInfo.getBuildNumber()}`;

  return (
    <SafeAreaView
      style={[
        {
          backgroundColor:
            colorScheme === 'dark' ? DarkTheme.colors.background : Colors.white,
          flex: 1,
        },
      ]}>
      <View style={styles.DrawerScreenHeader}>
        <RText style={styles.screenHeaderText}>Settings</RText>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.screenHeaderBack}>
          <Icon
            name="ios-chevron-back"
            size={28}
            color={
              colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
            }
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.SettingsScreen]}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{padding: 16, flex: 1}}>
          <View style={[styles.aboutRow, styles.aboutRowToggle]}>
            <View style={{flex: 1, marginRight: 8}}>
              <RText style={styles.aboutRowText}>Dark Mode</RText>
              <RText>
                If enabled, ignores system settings and uses Dark Mode always
              </RText>
            </View>
            <Switch
              onValueChange={async () =>
                await setAsyncStorageItem(
                  'dark_mode_override',
                  !asyncStorageData?.dark_mode_override,
                )
              }
              value={!!asyncStorageData?.dark_mode_override}
            />
          </View>
          <View style={styles.aboutRow}>
            <RText style={styles.aboutRowText}>{versionString}</RText>
          </View>
          <TouchableOpacity
            style={[styles.aboutRow]}
            onPress={async () => {
              await Share.share({url: SHARE_URL, title: SHARE_URL});
              analytics.logEvent('share');
            }}>
            <RText style={styles.aboutRowText}>Share this app</RText>
            <Icon
              name="chevron-forward"
              size={20}
              color={
                colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aboutRow]}
            onPress={() => {
              Linking.openURL(
                `mailto:${SUPPORT_EMAIL}?subject=${SUPPORT_EMAIL_SUBJECT}&body=${versionString}\n${SUPPORT_EMAIL_BODY}`,
              );
              analytics().logEvent('support');
            }}>
            <RText style={styles.aboutRowText}>Report an issue</RText>
            <Icon
              name="chevron-forward"
              size={20}
              color={
                colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aboutRow]}
            onPress={() => {
              Linking.openURL(
                Platform.OS === 'ios'
                  ? `itms-apps://itunes.apple.com/us/app/apple-store/${IOS_APP_ID}?mt=8`
                  : `market://details?id=${ANDROID_PACKAGE_NAME}`,
              );
              analytics().logEvent('rate');
            }}>
            <RText style={styles.aboutRowText}>
              Rate on {Platform.OS === 'ios' ? 'App' : 'Play'} Store
            </RText>
            <Icon
              name="chevron-forward"
              size={20}
              color={
                colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
              }
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  DrawerScreenHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 16,
  },
  screenHeaderText: {
    fontSize: FontSize.subheading,
    ...FontStyles.medium,
  },
  screenHeaderBack: {
    position: 'absolute',
    left: 16,
  },
  SettingsScreen: {
    flex: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutRowToggle: {
    justifyContent: 'space-between',
  },
  aboutRowDisabled: {
    opacity: 0.25,
  },
  aboutRowText: {
    fontSize: FontSize.subheading,
    marginRight: 8,
  },
});

export default SettingsScreen;
