import React, {useContext, useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './components/AsyncStorageProvider.js';
import {Brand, Colors, FontSize, FontStyles} from './const';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

export const RText = ({color = 'primary', style, children, ...props}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;
  const primaryColor =
    colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black;
  const secondaryColor =
    colorScheme === 'dark' ? 'rgb(170, 170, 172)' : Colors.darkGrey;
  const textColor = color === 'primary' ? primaryColor : secondaryColor;
  // hacky android line height fix for Space Grotesk
  const providedFontSize =
    style?.fontSize ||
    (style && style.find ? style.find(s => !!s.fontSize)?.fontSize : null);

  return (
    <Text
      style={[
        {color: textColor, fontFamily: Brand.defaultFont},
        Platform.OS !== 'ios'
          ? {lineHeight: providedFontSize * 1.25 || 20}
          : {},
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const VerticalSwipeView = ({
  onSwipeDown = () => {},
  style,
  children,
}) => {
  const [offset, setOffset] = useState(0);

  const swipeUp = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd(() => {
      onSwipeDown();
    })
    .runOnJS(!!onSwipeDown);

  return (
    <GestureDetector
      gesture={swipeUp}
      keyboardShouldPersistTaps="handled"
      style={{overflow: 'visible'}}
    >
      <View onStartShouldSetResponder={() => true} style={style}>
        {children}
      </View>
    </GestureDetector>
  );
};

export const RModal = ({
  modalVisible,
  setModalVisible,
  modalInnerNoPadding = false,
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);
  const insets = useSafeAreaInsets();

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropTransitionOutTiming={0}
      // Not sure why this is 2* to get the long category filter pill modal to fit
      style={[modalStyles.Modal, {marginTop: 2 * insets.top}]}
    >
      <VerticalSwipeView
        onSwipeDown={() => setModalVisible(false)}
        style={[
          modalStyles.ModalInner,
          modalInnerNoPadding ? sharedStyles.modalInnerNoPadding : {},
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}
      >
        {children}
      </VerticalSwipeView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  Modal: {
    margin: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  ModalInner: {
    borderRadius: 12,
    padding: 16,
  },
});

export const sharedStyles = StyleSheet.create({
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
    flex: 1,
    paddingRight: 120,
    marginBottom: 4,
  },
  itemModalHeaderInfoNoOverflow: {
    paddingRight: 8,
  },
  itemModalHeaderImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 120,
    width: 120,
    aspectRatio: 1,
  },
  itemModalHeaderImageNoOverflow: {
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
  },
  itemModalStatHeader: {
    ...FontStyles.semibold,
    fontSize: FontSize.bodyText,
    marginBottom: 8,
  },
  itemModalStatName: {
    flex: 1,
  },
  itemModalStatLabel: {
    fontSize: FontSize.bodyText,
  },
  itemModalStatLabelWrapper: {
    borderBottomWidth: 1,
  },
  itemModalStatCell: {
    paddingRight: 8,
  },
  itemModalStatText: {
    fontSize: FontSize.bodyText,
  },
  bodyText: {fontSize: FontSize.bodyText},
  mediumText: {
    ...FontStyles.medium,
  },
  achievementNameLink: {
    color: Colors.achievementColor,
    ...FontStyles.medium,
    fontSize: FontSize.bodyText,
  },
});
