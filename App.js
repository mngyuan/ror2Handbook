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
  KeyboardAvoidingView,
  Image,
  useColorScheme,
} from 'react-native';
import {SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
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
  white: 'white',
  lightGrey: '#dfdfdf',
  darkGrey: 'rgb(18,18,18)',
  black: 'black',
  rarityCommon: 'grey',
  rarityUncommon: 'green',
  rarityLegendary: 'red',
  rarityBoss: 'yellow',
  rarityLunar: 'blue',
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const RText = ({style, children, ...props}) => {
  const colorScheme = useColorScheme();
  return (
    <Text
      style={[
        {color: colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black},
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

const SearchScreen = ({navigation, type}) => {
  const colorScheme = useColorScheme();
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
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          }}>
          <KeyboardAvoidingView behavior="padding">
            <SearchBar
              placeholder="Search anything..."
              onChangeText={(text) => setSearch(text)}
              value={search}
              platform={Platform.OS === 'ios' ? 'ios' : 'android'}
              containerStyle={[
                styles.SearchBar,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? DarkTheme.colors.background
                      : Colors.white,
                },
              ]}
              inputContainerStyle={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? DarkTheme.colors.card
                    : Colors.lightGrey,
              }}
            />
            {/* fix for ScrollView inside Touchable */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              style={[
                styles.scrollView,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? DarkTheme.colors.background
                      : Colors.white,
                },
              ]}>
              {global.HermesInternal == null ? null : (
                <View style={styles.engine}>
                  <RText style={styles.footer}>Engine: Hermes</RText>
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
                      <RText>{v.name}</RText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
        <RText style={styles.detailName}>{item.name}</RText>
        <Image
          source={ITEM_IMAGES[item.name.replace(/ /g, '')]}
          style={styles.detailImage}
        />
        <RText style={styles.detailFlavor}>{item.flavorText}</RText>
        <RText style={[styles.detailRarity, styles[`rarity${item.rarity}`]]}>
          {item.rarity}
        </RText>
        <RText style={styles.detailCategory}>{item.category}</RText>
        <RText style={styles.detailDescription}>{item.description}</RText>
        {item.stats.map((stat) =>
          Object.entries(stat).map((entry) => (
            <RText key={entry[0]}>{entry[1]}</RText>
          )),
        )}
      </View>
    </ScrollView>
  );
};

const HomeScreen = ({type}) => {
  const colorScheme = useColorScheme();
  return (
    <Stack.Navigator initialRouteName="Search">
      <Stack.Screen
        name="Search"
        component={React.memo((props) => (
          <SearchScreen {...props} type={type} />
        ))}
        options={({navigation}) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.headerIcon}>
              <Icon
                name="menu"
                size={24}
                color={
                  colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
                }
              />
            </TouchableOpacity>
          ),
          headerMode: 'screen',
        })}
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
  const colorScheme = useColorScheme();
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    backgroundColor: Colors.white,
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
    color: Colors.black,
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
