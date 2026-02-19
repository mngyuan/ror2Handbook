import React from 'react';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import App from './src/App';

SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [fontsLoaded] = useFonts({
    'Space Grotesk': require('./assets/fonts/SpaceGrotesk-Regular.otf'),
    'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.otf'),
    'SpaceGrotesk-Medium': require('./assets/fonts/SpaceGrotesk-Medium.otf'),
    'SpaceGrotesk-SemiBold': require('./assets/fonts/SpaceGrotesk-SemiBold.otf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.otf'),
    'SpaceGrotesk-Light': require('./assets/fonts/SpaceGrotesk-Light.otf'),
    'Space Mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('./assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-BoldItalic': require('./assets/fonts/SpaceMono-BoldItalic.ttf'),
    'SpaceMono-Italic': require('./assets/fonts/SpaceMono-Italic.ttf'),
    'FiraMono-Regular': require('./assets/fonts/FiraMono-Regular.ttf'),
    'FiraMono-Medium': require('./assets/fonts/FiraMono-Medium.ttf'),
    'FiraMono-Bold': require('./assets/fonts/FiraMono-Bold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <App />;
}
