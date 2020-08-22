import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  useColorScheme,
  AppState,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
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
import ITEM_DATA from './gamepedia_item_data.json';
import EQP_DATA from './eqp_data.json';
import SURVIVOR_DATA from './survivor_data.json';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DATA = {
  items: {...ITEM_DATA, ...EQP_DATA},
  survivors: SURVIVOR_DATA,
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

const FontSize = {
  heading: 28,
  bodyText: 16,
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

const SearchBar = ({placeholder, onChangeText, value}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const textInput = useRef();

  return (
    <View style={[styles.SearchBar]}>
      <View
        style={[
          styles.searchBarInner,
          {
            backgroundColor:
              colorScheme === 'dark' ? DarkTheme.colors.card : Colors.lightGrey,
          },
        ]}>
        <Icon
          name="search"
          color={
            colorScheme === 'dark' ? DarkTheme.colors.text : 'rgba(76,60,60,67)'
          }
          size={18}
        />
        <TextInput
          ref={textInput}
          placeholder={placeholder}
          onChangeText={onChangeText}
          value={value}
          style={[styles.searchBarInput]}
          onFocus={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setIsFocused(true);
          }}
          onBlur={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setIsFocused(false);
          }}
        />
        {isFocused && value?.length > 0 ? (
          <TouchableWithoutFeedback onPress={() => onChangeText('')}>
            <View style={[{paddingRight: 8}, styles.verticalHitboxExtender]}>
              <Icon
                name="close-circle-sharp"
                color={
                  colorScheme === 'dark'
                    ? DarkTheme.colors.text
                    : 'rgba(76,60,60,67)'
                }
                size={18}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : null}
      </View>
      {isFocused ? (
        <TouchableOpacity
          onPress={() => textInput.current && textInput.current.blur()}>
          <View
            style={[{paddingLeft: 8, flex: 1}, styles.verticalHitboxExtender]}>
            <RText style={{color: 'rgb(10,132,255)'}}>Cancel</RText>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const SearchScreen = ({navigation, type}) => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState('');
  const [viewingItem, setViewingItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  console.log(viewingItem);

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
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{flex: 1}}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          }}>
          <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
            <SearchBar
              placeholder={`Search ${
                type ? type.toLocaleLowerCase() : 'anything'
              }...`}
              onChangeText={(text) => setSearch(text)}
              value={search}
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
                  flexGrow: 1,
                },
              ]}
              contentContainerStyle={{flexGrow: 1}}>
              <View
                style={styles.searchResults}
                onStartShouldSetResponder={() => true}>
                {searchDataSorted.map((v, i) => (
                  <TouchableOpacity
                    style={[styles.searchResult]}
                    key={v.name}
                    onPress={() => {
                      if (DATA.items[v.name]) {
                        setViewingItem(v.name);
                        setItemModalVisible(true);
                      } else {
                        navigation.navigate('Detail', {itemName: v.name});
                      }
                    }}>
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
        modalVisible={itemModalVisible}
        setModalVisible={() => setItemModalVisible(false)}
      />
    </>
  );
};

const ItemModal = ({itemName, modalVisible, setModalVisible}) => {
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
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
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
              <RText>{item.category?.replace(/\n/g, '→\u200b')} </RText>
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
          {'\u201c'}
          {item.flavorText}
          {'\u201d'}
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
  const colorScheme = useColorScheme();

  const {itemName} = route.params;
  const survivor = DATA.survivors[itemName] || {};
  return (
    <ScrollView>
      <View
        style={[
          styles.DetailScreen,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderInfo}>
            <RText style={styles.detailHeaderName}>{survivor.name}</RText>
            {survivor.unlock ? (
              <RText>
                Unlocked by
                <RText style={styles.achievementName}> {survivor.unlock}</RText>
              </RText>
            ) : null}
          </View>
          <Image
            source={IMAGES[survivor.name.replace(/ /g, '')]}
            style={styles.detailHeaderImage}
          />
        </View>
        {survivor.skills.map((skill) => (
          <View style={styles.detailSkillRow} key={skill.name}>
            <View style={styles.detailSkillInfo}>
              <RText style={styles.detailSkillHeader}>
                <RText style={styles.detailSkillName}>{skill.name}</RText>
                <RText> {skill.Type}</RText>
              </RText>
              <RText>{skill.Description}</RText>
            </View>
            <Image
              source={IMAGES[skill.name.replace(/ /g, '')]}
              style={styles.detailSkillImage}
            />
          </View>
        ))}
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
          title: type
            ? `${type[0].toLocaleUpperCase()}${type.slice(1)}`
            : 'RoR2 Handbook',
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
  scrollView: {},
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
  headerIcon: {marginLeft: 16},
  headerText: {
    // mimics default
    fontSize: 17,
    fontWeight: '600',
  },
  SearchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarInner: {
    borderRadius: 100,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    height: '100%',
  },
  searchBarInput: {
    padding: 12,
    flex: 1,
  },
  searchResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    padding: 4,
    paddingHorizontal: 16 - 4,
    paddingBottom: 32,
  },
  searchResult: {
    width: '20%',
    aspectRatio: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
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
  itemModalName: {
    fontWeight: 'bold',
    fontSize: FontSize.heading,
    marginBottom: 4,
  },
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
    fontSize: FontSize.bodyText,
  },
  itemModalFlavor: {
    marginBottom: 16,
    color: Colors.lightGrey,
    fontSize: FontSize.bodyText,
  },
  itemModalDescription: {marginBottom: 16, fontSize: FontSize.bodyText},
  itemModalStatRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemModalStatHeader: {},
  itemModalStatCell: {
    paddingRight: 8,
    fontWeight: '500',
    fontSize: FontSize.bodyText,
  },
  DetailScreen: {
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailHeaderInfo: {flex: 1, marginRight: 8},
  detailHeaderName: {
    fontWeight: 'bold',
    fontSize: FontSize.heading,
    marginBottom: 4,
  },
  detailHeaderImage: {
    width: `${100 / 2}%`,
    aspectRatio: 1,
  },
  detailSkillRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  detailSkillInfo: {
    flex: 1,
    marginRight: 8,
  },
  detailSkillHeader: {
    marginBottom: 4,
  },
  detailSkillName: {
    fontWeight: 'bold',
  },
  achievementName: {
    color: 'blue',
  },
  verticalHitboxExtender: {
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default App;
