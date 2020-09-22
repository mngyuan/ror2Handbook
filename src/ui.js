import React, {useContext, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, useColorScheme} from 'react-native';
import Modal from 'react-native-modal';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './components/AsyncStorageProvider.js';
import {Brand, Colors, FontSize, FontStyles} from './const';

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

  return (
    <Text
      style={[{color: textColor, fontFamily: Brand.defaultFont}, style]}
      {...props}>
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
  return (
    <ScrollView
      onScroll={(e) => {
        const offset = e.nativeEvent.contentOffset.y;
        setOffset(offset);
      }}
      onResponderRelease={() => {
        if (offset > -50) {
          return;
        }
        onSwipeDown();
      }}
      scrollEventThrottle={50}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{overflow: 'visible'}}>
      <View onStartShouldSetResponder={() => true} style={style}>
        {children}
      </View>
    </ScrollView>
  );
};

export const RModal = ({modalVisible, setModalVisible, children}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropTransitionOutTiming={0}
      style={modalStyles.Modal}>
      <VerticalSwipeView
        onSwipeDown={() => setModalVisible(false)}
        style={[
          modalStyles.ModalInner,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}>
        {children}
      </VerticalSwipeView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
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
    padding: 16,
    // we want to show ModalInner's background on vertical bounces
    paddingBottom: 24 + 512,
    marginBottom: -512,
  },
  modalInnerNoPadding: {
    padding: 0,
  },
  modalInnerPadding: {
    padding: 12,
    paddingBottom: 24,
  },
});

export const sharedStyles = StyleSheet.create({
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
