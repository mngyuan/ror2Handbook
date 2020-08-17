import React, {useState, useEffect} from 'react';
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
  AppState,
  Alert,
} from 'react-native';
import {SearchBar} from 'react-native-elements';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import IMAGES from './imgs/images.js';
import ITEM_DATA from './item_data.json';
import EQP_DATA from './eqp_data.json';

const DATA = {
  items: {...ITEM_DATA, ...EQP_DATA},
  //survivors: [{name: 'testsurvivor', id: 0}],
  //environments: [{name: 'testenvironment', id: 0}],
  //utilities: [{name: 'testdrone', id: 0}],
  survivors: [],
  environments: [],
  utilities: [],
};

const RARITY_ORDER = Object.fromEntries(
  [
    'Common',
    'Uncommon',
    'Legendary',
    'Boss',
    'Lunar',
    'Equipment',
    'Lunar Equipment',
    'Elite Equipment',
  ].map((rarity, i) => [rarity, i]),
);

const Colors = {
  white: 'white',
  lighterGrey: '#dadada',
  lightGrey: '#c0c0c0',
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

const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  const handleAppStateChange = (nextAppState) => setAppState(nextAppState);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return appState;
};

const RText = ({color = 'primary', style, children, ...props}) => {
  const colorScheme = useColorScheme();
  const primaryColor =
    colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black;
  const secondaryColor =
    colorScheme === 'dark' ? 'rgb(170, 170, 172)' : Colors.darkGrey;
  const textColor = color === 'primary' ? primaryColor : secondaryColor;
  return (
    <Text style={[{color: textColor}, style]} {...props}>
      {children}
    </Text>
  );
};

const SearchScreen = ({navigation, type}) => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState('');
  const [viewingItem, setViewingItem] = useState(null);

  const searchTokens = search.toLocaleLowerCase().split(/ +/);
  const baseData = type ? {type: DATA[type]} : DATA;
  const searchData = Object.values(baseData)
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
  const searchDataSorted = searchData.sort((a, b) => {
    if (RARITY_ORDER[a.rarity] < RARITY_ORDER[b.rarity]) {
      return -1;
    }
    if (RARITY_ORDER[a.rarity] === RARITY_ORDER[b.rarity]) {
      return a.name.localeCompare(b.name);
    }
    if (RARITY_ORDER[a.rarity] > RARITY_ORDER[b.rarity]) {
      return 1;
    }
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
                {searchDataSorted.map((v) => (
                  <TouchableOpacity
                    style={styles.searchResult}
                    key={v.name}
                    onPress={() => setViewingItem(v.name)}>
                    {IMAGES[v.name.replace(/ /g, '')] ? (
                      <Image
                        source={IMAGES[v.name.replace(/ /g, '')]}
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
      <ItemModal
        itemName={viewingItem}
        setViewingItem={(itemName) => setViewingItem(itemName)}
      />
    </>
  );
};

const ItemModal = ({itemName, setViewingItem}) => {
  const appState = useAppState();
  const colorScheme = useColorScheme();
  const item = DATA.items[itemName];
  useEffect(() => {
    if (__DEV__) {
      //appState === 'active' && Alert.alert('active!');
    }
  }, [appState]);
  return item ? (
    <Modal
      isVisible={!!itemName}
      onBackdropPress={() => setViewingItem(null)}
      style={styles.ItemModal}>
      <View
        style={[
          styles.ItemModalInner,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}>
        <View style={styles.itemModalHeader}>
          <View style={styles.itemModalHeaderInfo}>
            <RText
              style={[styles.itemModalName, styles[`rarity${item.rarity}`]]}>
              {item.name}
            </RText>
            <RText style={[styles.itemModalHeaderText]}>
              <RText>{item.category?.replace(/\n/g, '→')} </RText>
              <RText style={styles[`rarity${item.rarity}`]}>
                {item.rarity}
              </RText>
            </RText>
          </View>
          <Image
            source={IMAGES[item.name.replace(/ /g, '')]}
            style={styles.itemModalHeaderImage}
          />
        </View>
        <RText color="secondary" style={styles.itemModalFlavor}>
          "{item.flavorText}"
        </RText>
        <RText style={styles.itemModalDescription}>{item.description}</RText>
        {item.stats?.map((stat, i) => (
          <View style={styles.itemModalStatRow} key={i}>
            {Object.entries(stat).map(([k, v], i) => (
              <View key={k}>
                <RText
                  style={[
                    styles.itemModalStatCell,
                    styles.itemModalStatHeader,
                  ]}>
                  {k}
                </RText>
                <RText style={[styles.itemModalStatCell]}>{v}</RText>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Modal>
  ) : null;
};

const DetailScreen = ({route}) => {
  const {itemName} = route.params;
  const item = DATA.items[itemName] || {};
  return (
    <ScrollView>
      <View style={styles.DetailScreen}>
        <RText style={styles.detailName}>{item.name}</RText>
        <Image
          source={IMAGES[item.name.replace(/ /g, '')]}
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
    marginHorizontal: 4,
    paddingHorizontal: 4,
  },
  searchResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    padding: 4,
    paddingHorizontal: 16,
    paddingBottom: 32,
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
  ItemModal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 0,
  },
  ItemModalInner: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    paddingBottom: 24,
  },
  itemModalHeader: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemModalName: {fontWeight: 'bold', fontSize: 24, marginBottom: 4},
  itemModalHeaderInfo: {
    paddingRight: 120,
  },
  itemModalHeaderImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 120,
    width: 120,
    aspectRatio: 1,
  },
  itemModalHeaderText: {
    fontWeight: '500',
    marginBottom: 8,
  },
  itemModalFlavor: {marginBottom: 16, color: Colors.lightGrey},
  itemModalDescription: {marginBottom: 16},
  itemModalStatRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemModalStatHeader: {},
  itemModalStatCell: {
    paddingRight: 8,
    fontWeight: '500',
  },
  DetailScreen: {
    padding: 16,
  },
  detailName: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailFlavor: {
    fontSize: 24,
  },
  detailRarity: {
    fontSize: 20,
  },
  detailCategory: {
    fontSize: 20,
  },
  detailDescription: {
    fontSize: 20,
  },
});

export default App;
