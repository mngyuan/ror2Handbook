import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Button,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {DarkTheme} from '@react-navigation/native';
import {ArtifactModal} from './ArtifactModal.js';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {ChallengeModal} from './ChallengeModal.js';
import {ItemModal} from './ItemModal.js';
import {Colors, FontStyles, FontSize, HIDE_LIST} from '../const.js';
import {RModal, RText, sharedStyles} from '../ui.js';

import {
  SEARCHABLE_DATA,
  NONSEARCHABLE_DATA,
  RARITY_ORDER,
  SURVIVOR_ORDER,
  TYPE_ORDER,
} from '../const.js';
import IMAGES from '../../imgs/images.js';

const getDefaultSearchFilters = type =>
  type === 'items'
    ? {
        category: null,
        rarity: null,
        type: null,
      }
    : null;

const getType = o => {
  if (SEARCHABLE_DATA.items[o.name]) {
    return 'item';
  }
  if (SEARCHABLE_DATA.survivors[o.name]) {
    return 'survivor';
  }
  if (SEARCHABLE_DATA.artifacts[o.name]) {
    return 'artifact';
  }
  if (NONSEARCHABLE_DATA.challenges[o.name]) {
    return 'challenge';
  }
};

const findObjByName = name =>
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

const compareArtifacts = (a, b) => {
  return a.name.localeCompare(b.name);
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
  if (SEARCHABLE_DATA.artifacts[a.name] && SEARCHABLE_DATA.artifacts[b.name]) {
    return compareArtifacts(a, b);
  }
  if (TYPE_ORDER[getType(a)] < TYPE_ORDER[getType(b)]) {
    return -1;
  } else if (TYPE_ORDER[getType(a)] === TYPE_ORDER[getType(b)]) {
    // this is where a={} and b={} ends up
    return 0;
  } else {
    return 1;
  }
};

const SearchBar = ({placeholder, onChangeText, value}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textInput = useRef();
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return (
    <View style={[styles.SearchBar]}>
      <View
        style={[
          styles.searchBarInner,
          {
            backgroundColor:
              colorScheme === 'dark' ? DarkTheme.colors.card : Colors.lightGrey,
          },
        ]}
      >
        <Ionicons
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
              <Ionicons
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
          onPress={() => textInput.current && textInput.current.blur()}
        >
          <View
            style={[{paddingLeft: 8, flex: 1}, styles.verticalHitboxExtender]}
          >
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
    onPress={() => onSelect(!selected)}
  >
    <View style={styles.pickerModalRowInner}>
      <RText
        style={[
          styles.pickerModalRowText,
          selected ? styles.pickerSelectedText : {},
        ]}
      >
        {option}
      </RText>
      {multi && selected ? (
        <Ionicons name="checkmark" color={Colors.selected} size={24} />
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
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // We have to hold on to our own filter state, since we only want to update
  // the parent view once the filters have been set
  const [displayFilter, setDisplayFilter] = useState(filter);
  const {data: asyncStorageData} = useContext(AsyncStorageContext);
  const systemColorScheme = useColorScheme();

  const filterOn = multi ? filter && filter.length > 0 : !!filter;
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  useEffect(() => {
    setDisplayFilter(filter);
  }, [filter]);

  return (
    <>
      <Pill
        onPress={() => setFilterModalVisible(true)}
        backgroundColor={filterOn ? Colors.selected : undefined}
      >
        <Ionicons
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
      <RModal
        modalVisible={filterModalVisible}
        setModalVisible={setFilterModalVisible}
        modalInnerNoPadding
      >
        <RText style={styles.filterName}>{label}</RText>
        <ScrollView
          contentContainerStyle={[sharedStyles.modalInnerPadding]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
        >
          {filterOptions.map(option => (
            <PickerModalRow
              key={option}
              option={option}
              selected={
                multi
                  ? (displayFilter || []).includes(option)
                  : displayFilter === option
              }
              multi={multi}
              onSelect={select => {
                if (multi) {
                  const newFilter = select
                    ? [...(displayFilter || []), option]
                    : (displayFilter || []).filter(f => f !== option);
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
      </RModal>
    </>
  );
};

const Pill = ({onPress, children, backgroundColor}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

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
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const SearchFilters = ({searchFilters, setSearchFilters, type}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const itemCategories = Array.from(
    Object.values(SEARCHABLE_DATA.items).reduce((agg, cur) => {
      if (cur.category) {
        cur.category.split(/\n/g).map(c => agg.add(c));
      }
      return agg;
    }, new Set()),
  ).sort();
  const itemRarities = Object.keys(RARITY_ORDER).filter(
    rarity => !rarity.includes('Equipment'),
  );
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return searchFilters && type === 'items' ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.SearchFilters]}
      contentContainerStyle={{paddingHorizontal: 16}}
      keyboardShouldPersistTaps="handled"
    >
      <FilterPill
        filterOptions={itemCategories}
        label="Category"
        multi
        filter={searchFilters.category}
        onSetFilter={filter =>
          setSearchFilters({...searchFilters, category: filter})
        }
      />
      <FilterPill
        filterOptions={itemRarities}
        label="Rarity"
        multi
        filter={searchFilters.rarity}
        onSetFilter={filter =>
          setSearchFilters({...searchFilters, rarity: filter})
        }
      />
      <FilterPill
        filterOptions={['Equipment', 'Item']}
        label="Type"
        multi
        filter={searchFilters.type}
        onSetFilter={filter =>
          setSearchFilters({...searchFilters, type: filter})
        }
      />
      {(searchFilters.category ||
        searchFilters.rarity ||
        searchFilters.type) && (
        <Pill onPress={() => setSearchFilters(getDefaultSearchFilters(type))}>
          <Ionicons
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

export const SearchScreen = ({route, navigation}) => {
  const {type} = route.params;

  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);
  const [search, setSearch] = useState('');
  const [viewingItem, setViewingItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [viewingArtifact, setViewingArtifact] = useState(null);
  const [artifactModalVisible, setArtifactModalVisible] = useState(false);
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
        searchFilters.type.some(type =>
          type === 'Equipment'
            ? o.rarity.includes('Equipment')
            : !o.rarity.includes('Equipment'),
        ));
    const matchesFilteredRarity =
      !searchFilters.rarity ||
      (o.rarity &&
        searchFilters.rarity.some(rarity => o.rarity.includes(rarity)));
    const matchesFilteredCategory =
      !searchFilters.category ||
      (!!o.category &&
        searchFilters.category.some(category => o.category.includes(category)));
    return (
      matchesFilteredType && matchesFilteredRarity && matchesFilteredCategory
    );
  };

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  const searchTokens = search.toLocaleLowerCase().split(/ +/);
  const baseData = type
    ? {type: SEARCHABLE_DATA[type] || NONSEARCHABLE_DATA[type]}
    : SEARCHABLE_DATA;
  const searchData = Object.values(baseData)
    .map(Object.values)
    .flat()
    .filter(o => {
      const searchableFields = Object.values(o).filter(
        v => typeof v === 'string',
      );
      const matchesUserSearch = searchTokens.every(t =>
        searchableFields.some(s => s.toLocaleLowerCase().includes(t)),
      );
      return matchesUserSearch && checkMatchesSearchFilter(o, searchFilters);
    })
    .filter(o => !HIDE_LIST.includes(o.name));
  const searchDataSorted = searchData.sort(compareObjs);

  useEffect(() => {
    // scroll up if the search results are short
    if (searchDataSorted.length < 20) {
      scrollView.current &&
        scrollView.current.scrollTo({y: 0, animated: false});
    }
  }, [search, searchDataSorted.length]);

  useEffect(() => {
    setSearchFilters(getDefaultSearchFilters(type));
  }, [route, type]);

  const handlePress = v => {
    if (SEARCHABLE_DATA.items[v.name]) {
      setViewingItem(v.name);
      setItemModalVisible(true);
    } else if (NONSEARCHABLE_DATA.challenges[v.name]) {
      setViewingChallenge(v.name);
      setChallengeModalVisible(true);
    } else if (SEARCHABLE_DATA.artifacts[v.name]) {
      setViewingArtifact(v.name);
      setArtifactModalVisible(true);
    } else {
      navigation.navigate('Detail', {itemName: v.name});
    }
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{flex: 1}}
      >
        <View
          style={{
            flex: 1,
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
          >
            <SearchBar
              placeholder={`Search ${
                type ? type.toLocaleLowerCase() : 'anything'
              }...`}
              onChangeText={text => setSearch(text)}
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
              ref={scrollView}
            >
              <View
                style={styles.searchResults}
                onStartShouldSetResponder={() => true}
              >
                {searchDataSorted.map(v =>
                  type === 'survivors' ? (
                    <TouchableOpacity
                      style={[styles.searchResultRow]}
                      key={v.name}
                      onPress={() => handlePress(v)}
                    >
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
                      style={[
                        styles.searchResultRow,
                        {alignItems: 'flex-start'},
                      ]}
                      key={v.name}
                      onPress={() => handlePress(v)}
                    >
                      <RText style={[styles.searchResultRowName]}>
                        {v.name}
                      </RText>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          marginLeft: 12,
                          flex: 1,
                          justifyContent: 'flex-end',
                          height: '100%',
                        }}
                      >
                        {v.unlock
                          .split('\n')
                          .map(s => s.trim())
                          .filter(s => s.length > 0)
                          .map((unlock, i) =>
                            IMAGES[unlock.replace(/[ :]/g, '')] ? (
                              <Image
                                key={`${v.name}-${unlock}-${i}`}
                                source={IMAGES[unlock.replace(/[ :]/g, '')]}
                                style={[
                                  styles.searchResultSurvivorImage,
                                  {marginLeft: 12},
                                ]}
                              />
                            ) : (
                              <RText key={`${v.name}-${unlock}-${i}`}>
                                Image not found
                              </RText>
                            ),
                          )}
                      </View>
                    </TouchableOpacity>
                  ) : type === 'artifacts' ? (
                    <TouchableOpacity
                      style={[styles.searchResultRow]}
                      key={v.name}
                      onPress={() => handlePress(v)}
                    >
                      {IMAGES[v.name.replace(/ /g, '')] ? (
                        <Image
                          source={IMAGES[v.name.replace(/ /g, '')]}
                          style={[
                            styles.searchResultArtifactImage,
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
                  ) : (
                    <TouchableOpacity
                      style={[styles.searchResult]}
                      key={v.name}
                      onPress={() => handlePress(v)}
                    >
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
        </View>
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
      <ArtifactModal
        artifactName={viewingArtifact}
        modalVisible={artifactModalVisible}
        setModalVisible={() => setArtifactModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {},
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
    minHeight: 80,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  searchResultSurvivorImage: {
    width: `${100 / 2}%`,
    aspectRatio: 1,
  },
  searchResultArtifactImage: {
    width: `${100 / 4}%`,
    aspectRatio: 1,
  },
  searchResultRowName: {
    ...FontStyles.bold,
    fontSize: FontSize.subheading,
    flex: 1,
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
});
