import React, {useContext} from 'react';
import {TouchableOpacity, StyleSheet, useColorScheme} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {DarkTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {DetailScreen} from './DetailScreen.js';
import {SearchScreen} from './SearchScreen.js';
import {Brand, FontStyles, Colors} from '../const.js';

const Stack = createStackNavigator();

export const HomeScreen = ({type}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;
  return (
    <Stack.Navigator initialRouteName="Search">
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        initialParams={{type}}
        options={({navigation}) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.headerIcon}>
              <Ionicons
                name="menu"
                size={24}
                color={
                  colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
                }
              />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontFamily: Brand.defaultFont,
            ...FontStyles.semibold,
          },
          title: type
            ? `${type[0].toLocaleUpperCase()}${type.slice(1)}`
            : 'RoR2 Handbook',
        })}
      />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

export const ItemScreen = React.memo((props) => (
  <HomeScreen {...props} type="items" />
));
export const SurvivorScreen = React.memo((props) => (
  <HomeScreen {...props} type="survivors" />
));
export const ChallengeScreen = React.memo((props) => (
  <HomeScreen {...props} type="challenges" />
));
export const ArtifactScreen = React.memo((props) => (
  <HomeScreen {...props} type="artifacts" />
));

const styles = StyleSheet.create({
  headerIcon: {marginLeft: 16},
});
