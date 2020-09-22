import React, {useEffect, useState, useContext} from 'react';
import {Image, StyleSheet, View, useColorScheme} from 'react-native';
import Modal from 'react-native-modal';
import analytics from '@react-native-firebase/analytics';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {ChallengeModal} from './ChallengeModal.js';
import {Colors, FontSize, FontStyles, SEARCHABLE_DATA} from '../const.js';
import {RText, VerticalSwipeView} from '../ui.js';
import {getItemRarityColor, useAppState} from '../util.js';
import IMAGES from '../../imgs/images.js';

export const ItemModal = ({itemName, modalVisible, setModalVisible}) => {
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const appState = useAppState();
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const item = SEARCHABLE_DATA.items[itemName];
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

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
      <VerticalSwipeView
        onSwipeDown={() => setModalVisible(false)}
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
              {item.cooldown && <RText> {item.cooldown}</RText>}
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
        {item.stats ? (
          <>
            <RText style={styles.itemModalStatHeader}>Stats</RText>
            <View style={styles.itemModalStatRow}>
              <View
                style={[styles.itemModalStatCell, styles.itemModalStatName]}>
                <View
                  style={[
                    styles.itemModalStatLabelWrapper,
                    {
                      borderBottomColor:
                        colorScheme === 'dark'
                          ? DarkTheme.colors.text
                          : Colors.black,
                    },
                  ]}>
                  <RText style={[styles.itemModalStatLabel]}>Stat</RText>
                </View>
                <RText style={styles.itemModalStatText}>
                  {item.stats.map((stat) => stat.stat).join('\n')}
                </RText>
              </View>
              <View style={[styles.itemModalStatCell]}>
                <View
                  style={[
                    styles.itemModalStatLabelWrapper,
                    {
                      borderBottomColor:
                        colorScheme === 'dark'
                          ? DarkTheme.colors.text
                          : Colors.black,
                    },
                  ]}>
                  <RText style={[styles.itemModalStatLabel]}>Value</RText>
                </View>
                <RText style={styles.itemModalStatText}>
                  {item.stats.map((stat) => stat.value).join('\n')}
                </RText>
              </View>
              <View style={[styles.itemModalStatCell]}>
                <View
                  style={[
                    styles.itemModalStatLabelWrapper,
                    {
                      borderBottomColor:
                        colorScheme === 'dark'
                          ? DarkTheme.colors.text
                          : Colors.black,
                    },
                  ]}>
                  <RText style={[styles.itemModalStatLabel]}>Stacking</RText>
                </View>
                <RText style={styles.itemModalStatText}>
                  {item.stats.map((stat) => stat.stack).join('\n')}
                </RText>
              </View>
              <View style={[styles.itemModalStatCell]}>
                <View
                  style={[
                    styles.itemModalStatLabelWrapper,
                    {
                      borderBottomColor:
                        colorScheme === 'dark'
                          ? DarkTheme.colors.text
                          : Colors.black,
                    },
                  ]}>
                  <RText style={[styles.itemModalStatLabel]}>Add</RText>
                </View>
                <RText style={styles.itemModalStatText}>
                  {item.stats.map((stat) => stat.add).join('\n')}
                </RText>
              </View>
            </View>
          </>
        ) : null}
      </VerticalSwipeView>
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
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
  challengeModalUnlockImage: {
    height: 48,
    // not sure why not setting width doesn't work but all our images (i think)
    // are square
    width: 48,
  },
  achievementNameLink: {
    color: Colors.achievementColor,
    ...FontStyles.medium,
    fontSize: FontSize.bodyText,
  },
});
