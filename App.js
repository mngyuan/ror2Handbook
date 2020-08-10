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
  rarityCommon: 'grey',
  rarityUncommon: 'green',
  rarityLegendary: 'red',
  rarityBoss: 'yellow',
  rarityLunar: 'blue',
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const SearchScreen = ({navigation, type}) => {
  const [search, setSearch] = useState('');
  const searchTokens = search.toLocaleLowerCase().split(/ +/);
  const searchData = type
    ? DATA[type]
    : Object.values(DATA)
        .map(Object.values)
        .flat()
        .filter((o) => {
          const searchableFields = Object.values(o).filter(
            (v) => typeof v === 'string',
          );
          return searchTokens.every((t) =>
            searchableFields.some((s) => s.toLocaleLowerCase().includes(t)),
          );
        });
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
            containerStyle={styles.SearchBar}
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
                <TouchableOpacity
                  style={styles.searchResult}
                  key={v.name}
                  onPress={() =>
                    navigation.navigate('Detail', {itemName: v.name})
                  }>
                  {ITEM_IMAGES[v.name.replace(/ /g, '')] ? (
                    <Image
                      source={ITEM_IMAGES[v.name.replace(/ /g, '')]}
                      style={[styles.searchResultImage]}
                    />
                  ) : (
                    <Text>{v.name}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
};

const DetailScreen = ({route}) => {
  const {itemName} = route.params;
  const item = DATA.items[itemName] || {};
  return (
    <ScrollView>
      <View style={styles.DetailScreen}>
        <Text style={styles.detailName}>{item.name}</Text>
        <Image
          source={ITEM_IMAGES[item.name.replace(/ /g, '')]}
          style={styles.detailImage}
        />
        <Text style={styles.detailFlavor}>{item.flavorText}</Text>
        <Text style={[styles.detailRarity, styles[`rarity${item.rarity}`]]}>
          {item.rarity}
        </Text>
        <Text style={styles.detailCategory}>{item.category}</Text>
        <Text style={styles.detailDescription}>{item.description}</Text>
        {item.stats.map((stat) =>
          Object.entries(stat).map((entry) => (
            <Text key={entry[0]}>{entry[1]}</Text>
          )),
        )}
      </View>
    </ScrollView>
  );
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
  },
  headerSpacer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    paddingTop: 10,
  },
  headerIcon: {
    position: 'absolute',
    left: 4,
    top: 10,
  },
  headerText: {
    // mimics default
    fontSize: 17,
    fontWeight: '600',
  },
  SearchBar: {
    paddingHorizontal: 4,
  },
  searchResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    padding: 4,
  },
  searchResult: {
    width: '20%',
    aspectRatio: 1,
  },
  searchResultImage: {
    aspectRatio: 1,
    height: '100%',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  rarityCommon: {color: Colors.rarityCommon},
  rarityUncommon: {color: Colors.rarityUncommon},
  rarityLegendary: {color: Colors.rarityLegendary},
  rarityBoss: {color: Colors.rarityBoss},
  rarityLunar: {color: Colors.rarityLunar},
  DetailScreen: {
    alignItems: 'center',
    padding: 16,
  },
  detailName: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailFlavor: {
    fontSize: 24,
    textAlign: 'center',
  },
  detailRarity: {
    fontSize: 20,
  },
  detailCategory: {
    fontSize: 20,
    textAlign: 'center',
  },
  detailDescription: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default App;
