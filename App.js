/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Platform,
} from 'react-native';
import {SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Colors = {
  lighter: 'white',
  dark: 'black',
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const SearchScreen = () => {
  const [search, setSearch] = useState('');
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <SearchBar
            placeholder="Search anything..."
            onChangeText={(text) => setSearch(text)}
            value={search}
            platform={Platform.OS === 'ios' ? 'ios' : 'android'}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const DetailScreen = () => {
  return <></>;
};

const HomeScreen = () => {
  return (
    <Stack.Navigator initialRouteName="Search">
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          header: ({scene, previous, navigation}) => {
            const {options} = scene.descriptor;
            const title =
              options.headerTitle !== undefined
                ? options.headerTitle
                : options.title !== undefined
                ? options.title
                : scene.route.name;
            return (
              <SafeAreaView style={styles.header}>
                <View style={styles.headerSpacer}>
                  <Icon name="menu" size={24} style={styles.headerIcon} />
                  <View>
                    <Text style={styles.headerText}>{title}</Text>
                  </View>
                </View>
              </SafeAreaView>
            );
          },
          headerMode: 'screen',
        }}
      />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

const ItemScreen = () => {};
const SurvivorScreen = () => {};
const EnvironmentScreen = () => {};
const UtilityScreen = () => {};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Items" component={ItemScreen} />
        <Drawer.Screen name="Survivors" component={SurvivorScreen} />
        <Drawer.Screen name="Environments" component={EnvironmentScreen} />
        <Drawer.Screen name="Utilities" component={UtilityScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  header: {
    height: 80,
    width: '100%',
    padding: 12,
  },
  headerSpacer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  headerIcon: {
    position: 'absolute',
    left: 4,
  },
  headerText: {
    // mimics default
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
