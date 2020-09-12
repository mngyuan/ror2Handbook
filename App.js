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
  Button,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import analytics from '@react-native-firebase/analytics';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import IMAGES from './imgs/images.js';
import ITEM_DATA from './gamepedia_item_data.json';
import EQP_DATA from './gamepedia_eqp_data.json';
import SURVIVOR_DATA from './gamepedia_survivor_data.json';
import CHALLENGE_DATA from './challenge_data.json';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SEARCHABLE_DATA = {
  items: {...ITEM_DATA, ...EQP_DATA},
  survivors: SURVIVOR_DATA,
};

// Some data we don't want to show in the search all view...?
// We can include challenges into the search all view once we've found a way
// to visualize them
const NONSEARCHABLE_DATA = {
  challenges: CHALLENGE_DATA,
};

const TYPE_ORDER = {
  item: 0,
  survivor: 1,
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

const SURVIVOR_ORDER = Object.fromEntries(
  [
    'Commando',
    'Huntress',
    'MUL-T',
    'Engineer',
    'Artificer',
    'Mercenary',
    'REX',
    'Loader',
    'Acrid',
    'Captain',
    'Bandit',
    'Han-D',
  ].map((survivor, i) => [survivor, i]),
);

const HIDE_LIST = ['Han-D'];

const getItemRarityColor = (item) =>
  item.rarity
    ? item.rarity.includes('Boss')
      ? Colors.rarityBoss
      : item.rarity.includes('Equipment')
      ? Colors.rarityEquipment
      : Colors[`rarity${item.rarity}`]
    : null;

const getDefaultSearchFilters = (type) =>
  type === 'items'
    ? {
        category: null,
        rarity: null,
        type: null,
      }
    : null;

const Colors = {
  white: 'white',
  lighterGrey: '#dadada',
  lightGrey: '#c0c0c0',
  darkGrey: 'rgb(18,18,18)',
  black: 'black',
  rarityCommon: 'grey',
  rarityUncommon: 'green',
  rarityLegendary: 'red',
  rarityBoss: 'rgb(206,226,64)',
  rarityLunar: 'rgb(69, 220, 240)',
  rarityEquipment: 'orange',
  achievementColor: 'blue',
  selected: Platform.OS === 'ios' ? 'rgb(10,122,255)' : 'rgb(33,150,243)',
};

const Brand = {
  defaultFont: Platform.OS === 'ios' ? 'Space Grotesk' : 'SpaceGrotesk-Regular',
  monospaceFont: Platform.OS === 'ios' ? 'Space Mono' : 'SpaceMono-Regular',
};

const FontSize = {
  heading: 28,
  bodyText: 16,
  subheading: 20,
  monospace: 15,
};

const FontWeight = {
  bold: '700',
  semibold: '600',
  regular: '400',
  medium: '500',
};

// font weights / font families don't work on android
const FontStyles = {
  bold: {
    fontWeight: Platform.OS === 'ios' ? FontWeight.bold : FontWeight.regular,
    fontFamily: Platform.OS === 'ios' ? Brand.defaultFont : 'SpaceGrotesk-Bold',
  },
  semibold: {
    fontWeight:
      Platform.OS === 'ios' ? FontWeight.semibold : FontWeight.regular,
    fontFamily:
      Platform.OS === 'ios' ? Brand.defaultFont : 'SpaceGrotesk-SemiBold',
  },
  boldMono: {
    fontWeight: Platform.OS === 'ios' ? FontWeight.bold : FontWeight.regular,
    fontFamily: Platform.OS === 'ios' ? Brand.monospaceFont : 'SpaceMono-Bold',
  },
  medium: {
    fontWeight: Platform.OS === 'ios' ? FontWeight.medium : FontWeight.regular,
    fontFamily:
      Platform.OS === 'ios' ? Brand.defaultFont : 'SpaceGrotesk-Medium',
  },
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

const getType = (o) => {
  if (SEARCHABLE_DATA.items[o]) {
    return 'item';
  }
  if (SEARCHABLE_DATA.survivors[o]) {
    return 'survivor';
  }
  if (NONSEARCHABLE_DATA.challenges[o]) {
    return 'challenge';
  }
};

const findObjByName = (name) =>
  SEARCHABLE_DATA.items[name] ||
  SEARCHABLE_DATA.survivors[name] ||
  NONSEARCHABLE_DATA.challenges[name];

const compareItems = (a, b) => {
  if (RARITY_ORDER[a.rarity] < RARITY_ORDER[b.rarity]) {
    return -1;
  } else if (RARITY_ORDER[a.rarity] === RARITY_ORDER[b.rarity]) {
    return a.name.localeCompare(b.name);
  } else if (RARITY_ORDER[a.rarity] > RARITY_ORDER[b.rarity]) {
    return 1;
  }
};

const compareSurvivors = (a, b) => {
  if (SURVIVOR_ORDER[a.name] < SURVIVOR_ORDER[b.name]) {
    return -1;
  } else if (SURVIVOR_ORDER[a.name] === SURVIVOR_ORDER[b.name]) {
    return a.name.localeCompare(b.name);
  } else if (SURVIVOR_ORDER[a.name] > SURVIVOR_ORDER[b.name]) {
    return 1;
  }
};

const compareChallenges = (a, b) => {
  const unlockA = findObjByName(a.unlock) || {};
  const unlockB = findObjByName(b.unlock) || {};
  const res = compareObjs(unlockA, unlockB);
  return res;
};

const compareObjs = (a, b) => {
  if (SEARCHABLE_DATA.items[a.name] && SEARCHABLE_DATA.items[b.name]) {
    return compareItems(a, b);
  }
  if (SEARCHABLE_DATA.survivors[a.name] && SEARCHABLE_DATA.survivors[b.name]) {
    return compareSurvivors(a, b);
  }
  if (
    NONSEARCHABLE_DATA.challenges[a.name] &&
    NONSEARCHABLE_DATA.challenges[b.name]
  ) {
    return compareChallenges(a, b);
  }
  if (TYPE_ORDER[getType(a)] < TYPE_ORDER[getType(b)]) {
    return -1;
  } else if (TYPE_ORDER[getType(a)] === TYPE_ORDER[getType(b)]) {
    return 0;
  } else {
    return 1;
  }
};

const RText = ({color = 'primary', style, children, ...props}) => {
  const colorScheme = useColorScheme();
  const primaryColor =
    colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black;
  const secondaryColor =
    colorScheme === 'dark' ? 'rgb(170, 170, 172)' : Colors.darkGrey;
  const textColor = color === 'primary' ? primaryColor : secondaryColor;
  return (
    <Text
      style={[{color: textColor, fontFamily: Brand.defaultFont}, style]}
      {...props}>
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
          style={[
            styles.searchBarInput,
            colorScheme === 'dark' ? {color: DarkTheme.colors.text} : {},
          ]}
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

const PickerModalRow = ({
  option,
  selected,
  multi = false,
  onSelect = () => {},
}) => (
  <TouchableOpacity
    activeOpacity={multi ? 1 : undefined}
    style={[styles.PickerModalRow]}
    onPress={() => onSelect(!selected)}>
    <View style={styles.pickerModalRowInner}>
      <RText
        style={[
          styles.pickerModalRowText,
          selected ? styles.pickerSelectedText : {},
        ]}>
        {option}
      </RText>
      {multi && selected ? (
        <Icon name="checkmark" color={Colors.selected} size={24} />
      ) : null}
    </View>
  </TouchableOpacity>
);

const FilterPill = ({
  label,
  filter,
  onSetFilter,
  filterOptions = [],
  multi = false,
}) => {
  const colorScheme = useColorScheme();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // We have to hold on to our own filter state, since we only want to update
  // the parent view once the filters have been set
  const [displayFilter, setDisplayFilter] = useState(filter);
  const filterOn = multi ? filter && filter.length > 0 : !!filter;
  useEffect(() => {
    setDisplayFilter(filter);
  }, [filter]);
  return (
    <>
      <Pill
        onPress={() => setFilterModalVisible(true)}
        backgroundColor={filterOn ? Colors.selected : undefined}>
        <Icon
          name="chevron-down"
          size={12}
          color={colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black}
        />
        <RText style={[styles.filterPillLabel]}>
          {multi
            ? filter && filter.length > 0
              ? filter.join(' | ')
              : label
            : filter || label}
        </RText>
      </Pill>
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropTransitionOutTiming={0}
        style={styles.Modal}>
        <View
          style={[
            styles.ModalInner,
            styles.modalInnerNoPadding,
            {
              backgroundColor:
                colorScheme === 'dark'
                  ? DarkTheme.colors.background
                  : Colors.white,
            },
          ]}>
          <View>
            <RText style={styles.filterName}>{label}</RText>
            <ScrollView
              contentContainerStyle={[styles.modalInnerPadding]}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}>
              {filterOptions.map((option) => (
                <PickerModalRow
                  key={option}
                  option={option}
                  selected={
                    multi
                      ? (displayFilter || []).includes(option)
                      : displayFilter === option
                  }
                  multi={multi}
                  onSelect={(select) => {
                    if (multi) {
                      const newFilter = select
                        ? [...(displayFilter || []), option]
                        : (displayFilter || []).filter((f) => f !== option);
                      setDisplayFilter(newFilter.length > 0 ? newFilter : null);
                    } else {
                      setDisplayFilter(select ? option : '');
                      onSetFilter(select ? option : '');
                      setFilterModalVisible(false);
                    }
                  }}
                />
              ))}
              {multi ? (
                <Button
                  title="Apply"
                  onPress={() => {
                    onSetFilter(displayFilter);
                    setFilterModalVisible(false);
                  }}
                />
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const Pill = ({onPress, children, backgroundColor}) => {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.FilterPill,
        {
          backgroundColor:
            backgroundColor ||
            (colorScheme === 'dark' ? DarkTheme.colors.card : Colors.lightGrey),
        },
      ]}>
      {children}
    </TouchableOpacity>
  );
};

const SearchFilters = ({searchFilters, setSearchFilters, type}) => {
  const colorScheme = useColorScheme();
  const itemCategories = Array.from(
    Object.values(SEARCHABLE_DATA.items).reduce((agg, cur) => {
      if (cur.category) {
        cur.category.split(/\n/g).map((c) => agg.add(c));
      }
      return agg;
    }, new Set()),
  ).sort();
  const itemRarities = Object.keys(RARITY_ORDER).filter(
    (rarity) => !rarity.includes('Equipment'),
  );
  return searchFilters && type === 'items' ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.SearchFilters]}
      contentContainerStyle={{paddingHorizontal: 16}}
      keyboardShouldPersistTaps="handled">
      <FilterPill
        filterOptions={itemCategories}
        label="Category"
        multi
        filter={searchFilters.category}
        onSetFilter={(filter) =>
          setSearchFilters({...searchFilters, category: filter})
        }
      />
      <FilterPill
        filterOptions={itemRarities}
        label="Rarity"
        multi
        filter={searchFilters.rarity}
        onSetFilter={(filter) =>
          setSearchFilters({...searchFilters, rarity: filter})
        }
      />
      <FilterPill
        filterOptions={['Equipment', 'Item']}
        label="Type"
        multi
        filter={searchFilters.type}
        onSetFilter={(filter) =>
          setSearchFilters({...searchFilters, type: filter})
        }
      />
      {(searchFilters.category ||
        searchFilters.rarity ||
        searchFilters.type) && (
        <Pill onPress={() => setSearchFilters(getDefaultSearchFilters(type))}>
          <Icon
            name="close-circle-sharp"
            size={12}
            color={
              colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black
            }
          />
          <RText style={[styles.filterPillLabel]}>Clear</RText>
        </Pill>
      )}
    </ScrollView>
  ) : null;
};

const SearchScreen = ({route, navigation}) => {
  const {type} = route.params;

  const colorScheme = useColorScheme();
  const [search, setSearch] = useState('');
  const [viewingItem, setViewingItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [searchFilters, setSearchFilters] = useState(
    getDefaultSearchFilters(type),
  );
  const scrollView = useRef();

  const checkMatchesSearchFilter = (o, searchFilters) => {
    if (!searchFilters || type !== 'items') {
      return true;
    }
    const matchesFilteredType =
      !searchFilters.type ||
      (o.rarity &&
        searchFilters.type.some((type) =>
          type === 'Equipment'
            ? o.rarity.includes('Equipment')
            : !o.rarity.includes('Equipment'),
        ));
    const matchesFilteredRarity =
      !searchFilters.rarity ||
      (o.rarity &&
        searchFilters.rarity.some((rarity) => o.rarity.includes(rarity)));
    const matchesFilteredCategory =
      !searchFilters.category ||
      (!!o.category &&
        searchFilters.category.some((category) =>
          o.category.includes(category),
        ));
    return (
      matchesFilteredType && matchesFilteredRarity && matchesFilteredCategory
    );
  };

  const searchTokens = search.toLocaleLowerCase().split(/ +/);
  const baseData = type
    ? {type: SEARCHABLE_DATA[type] || NONSEARCHABLE_DATA[type]}
    : SEARCHABLE_DATA;
  const searchData = Object.values(baseData)
    .map(Object.values)
    .flat()
    .filter((o) => {
      const searchableFields = Object.values(o).filter(
        (v) => typeof v === 'string',
      );
      const matchesUserSearch = searchTokens.every((t) =>
        searchableFields.some((s) => s.toLocaleLowerCase().includes(t)),
      );
      return matchesUserSearch && checkMatchesSearchFilter(o, searchFilters);
    })
    .filter((o) => !HIDE_LIST.includes(o.name));
  const searchDataSorted = searchData.sort(compareObjs);

  useEffect(() => {
    // scroll up if the search results are short
    if (searchDataSorted.length < 20) {
      scrollView.current &&
        scrollView.current.scrollTo({y: 0, animated: false});
    }
  }, [search, searchDataSorted.length]);

  useEffect(() => {
    if (itemModalVisible) {
      analytics().logViewItem({
        items: [
          {
            item_name: viewingItem.name,
            item_category: 'item',
            item_category2: viewingItem.category,
          },
        ],
      });
    }
  }, [viewingItem, itemModalVisible]);

  useEffect(() => {
    setSearchFilters(getDefaultSearchFilters(type));
  }, [route, type]);

  return (
    <>
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
          <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <SearchBar
              placeholder={`Search ${
                type ? type.toLocaleLowerCase() : 'anything'
              }...`}
              onChangeText={(text) => setSearch(text)}
              value={search}
            />
            <SearchFilters
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              type={type}
            />
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
              contentContainerStyle={{flexGrow: 1}}
              ref={scrollView}>
              <View
                style={styles.searchResults}
                onStartShouldSetResponder={() => true}>
                {searchDataSorted.map((v) =>
                  type === 'survivors' ? (
                    <TouchableOpacity
                      style={[styles.searchResultRow]}
                      key={v.name}
                      onPress={() => {
                        if (SEARCHABLE_DATA.items[v.name]) {
                          setViewingItem(v.name);
                          setItemModalVisible(true);
                        } else if (NONSEARCHABLE_DATA.challenges[v.name]) {
                          setViewingChallenge(v.name);
                          setChallengeModalVisible(true);
                        } else {
                          navigation.navigate('Detail', {itemName: v.name});
                        }
                      }}>
                      {IMAGES[v.name.replace(/ /g, '')] ? (
                        <Image
                          source={IMAGES[v.name.replace(/ /g, '')]}
                          style={[
                            styles.searchResultSurvivorImage,
                            {marginRight: 12},
                          ]}
                        />
                      ) : (
                        <RText>Image not found</RText>
                      )}
                      <RText style={[styles.searchResultRowName]}>
                        {v.name}
                      </RText>
                    </TouchableOpacity>
                  ) : type === 'challenges' ? (
                    <TouchableOpacity
                      style={[styles.searchResultRow]}
                      key={v.name}
                      onPress={() => {
                        if (SEARCHABLE_DATA.items[v.name]) {
                          setViewingItem(v.name);
                          setItemModalVisible(true);
                        } else if (NONSEARCHABLE_DATA.challenges[v.name]) {
                          setViewingChallenge(v.name);
                          setChallengeModalVisible(true);
                        } else {
                          navigation.navigate('Detail', {itemName: v.name});
                        }
                      }}>
                      <RText style={[styles.searchResultRowName]}>
                        {v.name}
                      </RText>
                      {v.unlock
                        .split('\n')
                        .map((unlock) =>
                          IMAGES[unlock.replace(/ /g, '')] ? (
                            <Image
                              key={unlock}
                              source={IMAGES[unlock.replace(/ /g, '')]}
                              style={[
                                styles.searchResultSurvivorImage,
                                {marginLeft: 12},
                              ]}
                            />
                          ) : (
                            <RText key={unlock}>Image not found</RText>
                          ),
                        )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.searchResult]}
                      key={v.name}
                      onPress={() => {
                        if (SEARCHABLE_DATA.items[v.name]) {
                          setViewingItem(v.name);
                          setItemModalVisible(true);
                        } else if (NONSEARCHABLE_DATA.challenges[v.name]) {
                          setViewingChallenge(v.name);
                          setChallengeModalVisible(true);
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
                  ),
                )}
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
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </>
  );
};

const ItemModal = ({itemName, modalVisible, setModalVisible}) => {
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const appState = useAppState();
  const colorScheme = useColorScheme();
  const item = SEARCHABLE_DATA.items[itemName];

  useEffect(() => {
    if (__DEV__) {
      //appState === 'active' && Alert.alert('active!');
    }
  }, [appState]);

  useEffect(() => {
    if (challengeModalVisible) {
      analytics().logViewItem({
        items: [
          {
            item_name: viewingChallenge.name,
            item_category: 'challenge',
            item_category2: viewingChallenge.category,
          },
        ],
      });
    }
  }, [viewingChallenge, challengeModalVisible]);

  return item ? (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropTransitionOutTiming={0}
      style={styles.Modal}>
      <View
        style={[
          styles.ModalInner,
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
              style={[
                styles.itemModalHeaderRow,
                styles.ModalName,
                {color: getItemRarityColor(item)},
              ]}>
              {item.name}
            </RText>
            <RText
              style={[styles.itemModalHeaderRow, styles.itemModalHeaderText]}>
              <RText>
                {item.category?.replace(/\n/g, '→\u200b')}
                {item.category ? ' ' : ''}
              </RText>
              <RText style={{color: getItemRarityColor(item)}}>
                {item.rarity}
              </RText>
            </RText>
            {item.unlock && (
              <View style={[styles.itemModalHeaderRow]}>
                <RText style={[styles.itemModalHeaderText]}>
                  Unlocked by{' '}
                  <RText
                    style={[styles.achievementNameLink]}
                    onPress={() => {
                      setViewingChallenge(item.unlock);
                      setChallengeModalVisible(true);
                    }}>
                    {item.unlock}
                  </RText>
                </RText>
              </View>
            )}
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
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </Modal>
  ) : null;
};

const ChallengeModal = ({challengeName, modalVisible, setModalVisible}) => {
  const colorScheme = useColorScheme();
  const challenge = NONSEARCHABLE_DATA.challenges[challengeName];

  return challenge ? (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropTransitionOutTiming={0}
      style={styles.Modal}>
      <View
        style={[
          styles.ModalInner,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}>
        <RText
          style={[
            styles.ModalName,
            styles.itemModalHeaderRow,
            {color: Colors.achievementColor},
          ]}>
          {challenge.name}
        </RText>
        <RText style={[styles.bodyText, {marginBottom: 4}]}>
          {challenge.description}
        </RText>
        <RText style={[styles.bodyText, {marginBottom: 4}]}>
          Unlocks{' '}
          <RText style={[styles.bodyText, styles.mediumText]}>
            {challenge.unlock}
          </RText>
          {IMAGES[challenge.unlock.replace(/ /g, '')] ? (
            <>
              {' '}
              <Image
                source={IMAGES[challenge.unlock.replace(/ /g, '')]}
                style={[styles.challengeModalUnlockImage]}
              />{' '}
            </>
          ) : null}
          .
        </RText>
      </View>
    </Modal>
  ) : null;
};

const DetailScreen = ({route}) => {
  const colorScheme = useColorScheme();
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);

  const {itemName} = route.params;
  const survivor = SEARCHABLE_DATA.survivors[itemName] || {};

  useEffect(() => {
    if (itemName) {
      analytics().logViewItem({
        items: [{item_name: itemName, item_category: 'survivor'}],
      });
    }
  }, [itemName]);

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
            <RText style={styles.detailSectionHeader}>{survivor.name}</RText>
            {survivor.stats.Unlock ? (
              <RText style={[styles.bodyText, {marginBottom: 4}]}>
                Unlocked by{' '}
                <RText
                  style={styles.achievementNameLink}
                  onPress={() => {
                    setViewingChallenge(survivor.stats.Unlock);
                    setChallengeModalVisible(true);
                  }}>
                  {survivor.stats.Unlock}
                </RText>
              </RText>
            ) : null}
            {survivor.description ? (
              <RText style={[styles.bodyText, {marginBottom: 4}]}>
                {survivor.description}
              </RText>
            ) : null}
          </View>
          <Image
            source={IMAGES[survivor.name.replace(/ /g, '')]}
            style={styles.detailHeaderImage}
          />
        </View>
        {Object.entries(survivor.stats).length > 0 ? (
          <>
            <RText style={[styles.detailSectionHeader]}>Stats</RText>
            <View style={styles.detailStats}>
              {Object.entries(survivor.stats)
                .filter(([k]) => !['Unlock'].includes(k))
                .map(([k, v]) => (
                  <RText style={styles.detailStat} key={k}>
                    <RText style={styles.detailStatLabel}>{k}</RText> {v}
                  </RText>
                ))}
            </View>
          </>
        ) : null}
        {survivor.skills && survivor.skills.length > 0 ? (
          <>
            <RText style={[styles.detailSectionHeader]}>Skills</RText>
            {survivor.skills.map((skill) => (
              <View style={styles.detailSkillRow} key={skill.name}>
                <View style={styles.detailSkillInfo}>
                  <RText style={styles.detailSkillHeader}>
                    <RText style={styles.detailSkillName}>{skill.name}</RText>
                    <RText> {skill.Type}</RText>
                    {skill.Cooldown ? <RText>, {skill.Cooldown}</RText> : null}
                  </RText>
                  {skill.Notes && skill.Notes.includes('Unlock') ? (
                    <RText style={[styles.bodyText, styles.detailSkillUnlock]}>
                      Unlocked by{' '}
                      <RText
                        style={styles.achievementNameLink}
                        onPress={() => {
                          const unlock = skill.Notes.match(
                            /Unlocked via the (.*) Challenge\./,
                          )[1];
                          setViewingChallenge(unlock);
                          setChallengeModalVisible(true);
                        }}>
                        {
                          skill.Notes.match(
                            /Unlocked via the (.*) Challenge\./,
                          )[1]
                        }
                      </RText>
                    </RText>
                  ) : null}
                  <RText
                    style={[styles.bodyText, styles.detailSkillDescription]}>
                    {skill.Description.replace(/\n/g, '')}
                  </RText>
                  {skill['Proc Coefficient'] ? (
                    <RText style={styles.detailStat}>
                      <RText style={styles.detailStatLabel}>
                        Proc Coefficient{' '}
                      </RText>
                      {skill['Proc Coefficient']}
                    </RText>
                  ) : null}
                </View>
                <Image
                  source={
                    IMAGES[skill.name.replace(/ /g, '')] ||
                    IMAGES[skill.name.replace(/ |:/g, '')]
                  }
                  style={styles.detailSkillImage}
                />
              </View>
            ))}
          </>
        ) : null}
      </View>
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </ScrollView>
  );
};

const HomeScreen = ({type}) => {
  const colorScheme = useColorScheme();
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

const ItemScreen = React.memo((props) => (
  <HomeScreen {...props} type="items" />
));
const SurvivorScreen = React.memo((props) => (
  <HomeScreen {...props} type="survivors" />
));
const ChallengeScreen = React.memo((props) => (
  <HomeScreen {...props} type="challenges" />
));
const EnvironmentScreen = React.memo((props) => (
  <HomeScreen {...props} type="environments" />
));
const UtilityScreen = React.memo((props) => (
  <HomeScreen {...props} type="utilities" />
));

const AboutScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
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
        <RText style={styles.screenHeaderText}>About</RText>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.screenHeaderBack}>
          <Icon name="ios-chevron-back" size={28} />
        </TouchableOpacity>
      </View>
      <View style={[styles.AboutScreen]}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{padding: 16, flex: 1}}>
          <View style={styles.aboutRow}>
            <RText style={styles.aboutRowText}>
              Version: {DeviceInfo.getReadableVersion()}
            </RText>
          </View>
          <TouchableOpacity
            style={[styles.aboutRow, styles.aboutRowDisabled]}
            onPress={() => {}}
            disabled>
            <RText style={styles.aboutRowText}>Share this app</RText>
            <Icon name="chevron-forward" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aboutRow, styles.aboutRowDisabled]}
            onPress={() => {}}
            disabled>
            <RText style={styles.aboutRowText}>Report an issue</RText>
            <Icon name="chevron-forward" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aboutRow, styles.aboutRowDisabled]}
            onPress={() => {}}
            disabled>
            <RText style={styles.aboutRowText}>
              Rate on {Platform.OS === 'ios' ? 'App' : 'Play'} Store
            </RText>
            <Icon name="chevron-forward" size={20} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  const colorScheme = useColorScheme();
  const navigationRef = useRef();
  const routeNameRef = useRef();

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
      <Drawer.Navigator
        initialRouteName="Home"
        drawerType="slide"
        drawerContentOptions={{labelStyle: {fontFamily: Brand.defaultFont}}}>
        <Drawer.Screen
          name="Home"
          component={React.memo((props) => (
            <HomeScreen {...props} type={null} />
          ))}
        />
        <Drawer.Screen name="Items" component={ItemScreen} />
        <Drawer.Screen name="Survivors" component={SurvivorScreen} />
        <Drawer.Screen name="Challenges" component={ChallengeScreen} />
        <Drawer.Screen name="About" component={AboutScreen} />
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
    ...FontStyles.semibold,
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
  searchResultRow: {
    width: '100%',
    flexDirection: 'row',
    aspectRatio: null,
    paddingHorizontal: 4,
    paddingVertical: 4,
    height: 80,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  searchResultSurvivorImage: {
    width: `${100 / 3}%`,
    aspectRatio: 1,
  },
  searchResultRowName: {
    ...FontStyles.bold,
    fontSize: FontSize.subheading,
    flex: 1,
  },
  footer: {
    color: Colors.black,
    fontSize: 12,
    ...FontStyles.semibold,
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  Modal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 0,
  },
  ModalInner: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    paddingBottom: 24,
  },
  modalInnerNoPadding: {
    padding: 0,
  },
  modalInnerPadding: {
    padding: 12,
    paddingBottom: 24,
  },
  itemModalHeader: {
    position: 'relative',
    flexDirection: 'row',
    marginBottom: 4,
  },
  ModalName: {
    ...FontStyles.bold,
    fontSize: FontSize.heading,
    lineHeight: 30,
  },
  itemModalHeaderInfo: {
    paddingRight: 120,
    marginBottom: 4,
  },
  itemModalHeaderImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 120,
    width: 120,
    aspectRatio: 1,
  },
  itemModalHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemModalHeaderText: {
    ...FontStyles.medium,
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
    fontSize: FontSize.monospace,
    fontFamily: Brand.monospaceFont,
  },
  DetailScreen: {
    padding: 16,
  },
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
  AboutScreen: {
    flex: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutRowDisabled: {
    opacity: 0.25,
  },
  aboutRowText: {
    fontSize: FontSize.subheading,
    marginRight: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailHeaderInfo: {flex: 1, marginRight: 8},
  bodyText: {fontSize: FontSize.bodyText},
  mediumText: {
    ...FontStyles.medium,
  },
  detailSectionHeader: {
    fontSize: FontSize.heading,
    ...FontStyles.bold,
    marginBottom: 4,
  },
  detailHeaderImage: {
    width: '45%',
    aspectRatio: 1,
  },
  detailStats: {
    marginBottom: 24,
  },
  detailStat: {
    fontSize: FontSize.monospace,
    fontFamily: Brand.monospaceFont,
  },
  detailStatLabel: {
    ...FontStyles.boldMono,
  },
  detailAchievementNameLink: {},
  detailSkillRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  detailSkillImage: {
    width: 80,
    aspectRatio: 1,
  },
  detailSkillInfo: {
    flex: 1,
    marginRight: 8,
  },
  detailSkillHeader: {
    fontSize: FontSize.subheading,
  },
  detailSkillUnlock: {
    marginBottom: 4,
  },
  detailSkillName: {
    ...FontStyles.bold,
  },
  detailSkillDescription: {
    marginTop: 4,
    marginBottom: 4,
  },
  achievementNameLink: {
    color: Colors.achievementColor,
    ...FontStyles.medium,
    fontSize: FontSize.bodyText,
  },
  verticalHitboxExtender: {
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  PickerModalRow: {
    paddingVertical: 8,
  },
  SearchFilters: {
    marginBottom: 8,
    flexGrow: 0,
  },
  FilterPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 100,
    marginRight: 4,
    paddingHorizontal: 4,
  },
  filterPillLabel: {
    ...FontStyles.semibold,
    fontSize: FontSize.bodyText,
    padding: 4,
  },
  filterName: {
    marginTop: 12,
    marginLeft: 12,
    fontSize: FontSize.heading,
    ...FontStyles.bold,
  },
  pickerModalRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerModalRowText: {
    ...FontStyles.semibold,
    fontSize: FontSize.subheading,
  },
  pickerSelectedText: {
    color: Colors.selected,
  },
  challengeModalUnlockImage: {
    height: 48,
    // not sure why not setting width doesn't work but all our images (i think)
    // are square
    width: 48,
  },
});

export default App;
