import {Platform} from 'react-native';

import ITEM_DATA from './static/gamepedia_item_data.json';
import EQP_DATA from './static/gamepedia_eqp_data.json';
import SURVIVOR_DATA from './static/gamepedia_survivor_data.json';
import CHALLENGE_DATA from './static/challenge_data.json';
import ARTIFACT_DATA from './static/artifact_data.json';

export const SEARCHABLE_DATA = {
  items: {...ITEM_DATA, ...EQP_DATA},
  survivors: SURVIVOR_DATA,
  artifacts: ARTIFACT_DATA,
};

// Some data we don't want to show in the search all view...?
// We can include challenges into the search all view once we've found a way
// to visualize them
export const NONSEARCHABLE_DATA = {
  challenges: CHALLENGE_DATA,
};

export const IOS_APP_ID = 'id1528143765';
export const ANDROID_PACKAGE_NAME = 'com.ror2handbook';

export const TYPE_ORDER = {
  item: 0,
  survivor: 1,
  artifact: 2,
};

export const RARITY_ORDER = Object.fromEntries(
  [
    'Common',
    'Uncommon',
    'Legendary',
    'Boss',
    'Lunar',
    'Void',
    'Equipment',
    'Lunar Equipment',
    'Elite Equipment',
  ].map((rarity, i) => [rarity, i]),
);

export const SURVIVOR_ORDER = Object.fromEntries(
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

export const HIDE_LIST = ['Han-D'];

export const Colors = {
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

export const Brand = {
  defaultFont: Platform.OS === 'ios' ? 'Space Grotesk' : 'SpaceGrotesk-Regular',
  monospaceFont: Platform.OS === 'ios' ? 'Space Mono' : 'SpaceMono-Regular',
};

export const FontSize = {
  heading: 28,
  bodyText: 16,
  subheading: 20,
  monospace: 15,
};

export const FontWeight = {
  bold: '700',
  semibold: '600',
  regular: '400',
  medium: '500',
};

// font weights / font families don't work on android
export const FontStyles = {
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
  regular: {
    fontWeight: FontWeight.regular,
    fontFamily: Brand.defaultFont,
  },
};
