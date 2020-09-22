import React, {useRef, useContext} from 'react';
import {StatusBar, useColorScheme, Platform, UIManager} from 'react-native';
import analytics, {firebase} from '@react-native-firebase/analytics';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import AsyncStorageProvider, {
  AsyncStorageContext,
} from './components/AsyncStorageProvider.js';
import {
  HomeScreen,
  ItemScreen,
  SurvivorScreen,
  ChallengeScreen,
  ArtifactScreen,
} from './components/HomeScreen.js';
import SettingsScreen from './components/SettingsScreen.js';
import {Brand, Colors} from './const.js';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const enableAnalytics = async () =>
  await firebase.analytics().setAnalyticsCollectionEnabled(!__DEV__);
enableAnalytics();

const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <AsyncStorageProvider>
      <NavigationRoot>
        <Root />
      </NavigationRoot>
    </AsyncStorageProvider>
  );
};

const Root = () => (
  <>
    <Drawer.Navigator
      initialRouteName="Home"
      drawerType="slide"
      drawerContentOptions={{
        labelStyle: {fontFamily: Brand.defaultFont},
      }}>
      <Drawer.Screen
        name="Home"
        component={React.memo((props) => (
          <HomeScreen {...props} type={null} />
        ))}
      />
      <Drawer.Screen name="Items" component={ItemScreen} />
      <Drawer.Screen name="Survivors" component={SurvivorScreen} />
      <Drawer.Screen name="Challenges" component={ChallengeScreen} />
      <Drawer.Screen name="Artifacts" component={ArtifactScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  </>
);

const NavigationRoot = ({children}) => {
  const navigationRef = useRef();
  const routeNameRef = useRef();
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          analytics().logScreenView({screen_name: currentRouteName});
        }

        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
      }}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? Colors.black : Colors.white}
      />
      {children}
    </NavigationContainer>
  );
};

export default App;
