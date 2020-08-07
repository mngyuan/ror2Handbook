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
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import {SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import ITEM_IMAGES from './imgs/images.js';
console.log(ITEM_IMAGES);
import ITEM_DATA from './item_data.json';

const DATA = {
  items: ITEM_DATA,
  survivors: [{name: 'testsurvivor', id: 0}],
  environments: [{name: 'testenvironment', id: 0}],
  utilities: [{name: 'testdrone', id: 0}],
};

const Colors = {
  lighter: 'white',
  dark: 'black',
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const SearchScreen = ({type}) => {
  const [search, setSearch] = useState('');
  const searchTokens = search.toLocaleLowerCase().split(/ +/);
  const searchData = (type ? DATA[type] : Object.values(DATA).flat()).filter(
    (o) => {
      const searchableFields = Object.values(o).filter(
        (v) => typeof v === 'string',
      );
      return searchTokens.every((t) =>
        searchableFields.some((s) => s.toLocaleLowerCase().includes(t)),
      );
    },
  );
  console.log(searchData);
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={{flex: 1}}>
          {/* fix for ScrollView inside Touchable */}
          <SearchBar
            placeholder="Search anything..."
            onChangeText={(text) => setSearch(text)}
            value={search}
            platform={Platform.OS === 'ios' ? 'ios' : 'android'}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View
              style={styles.searchResults}
              onStartShouldSetResponder={() => true}>
              {searchData.map((v) => (
                <View style={styles.searchResult} key={v.name}>
                  {ITEM_IMAGES[v.name.replace(/ /g, '')] ? (
                    <Image
                      source={ITEM_IMAGES[v.name.replace(/ /g, '')]}
                      style={styles.searchResultImage}
                    />
                  ) : (
                    <Text>{v.name}</Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
};

const DetailScreen = () => {
  return <></>;
};

const HomeScreen = ({type}) => {
  return (
    <Stack.Navigator initialRouteName="Search">
      <Stack.Screen
        name="Search"
        component={React.memo((props) => (
          <SearchScreen {...props} type={type} />
        ))}
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
                  <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    style={styles.headerIcon}>
                    <Icon name="menu" size={24} />
                  </TouchableOpacity>
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

const ItemScreen = React.memo((props) => (
  <HomeScreen {...props} type="items" />
));
const SurvivorScreen = React.memo((props) => (
  <HomeScreen {...props} type="survivors" />
));
const EnvironmentScreen = React.memo((props) => (
  <HomeScreen {...props} type="environments" />
));
const UtilityScreen = React.memo((props) => (
  <HomeScreen {...props} type="utilities" />
));

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen
          name="Home"
          component={React.memo((props) => (
            <HomeScreen {...props} type={null} />
          ))}
        />
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
  searchResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchResult: {},
  searchResultImage: {},
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
