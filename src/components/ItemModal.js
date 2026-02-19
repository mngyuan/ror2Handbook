import React, {useState, useContext} from 'react';
import {Image, Platform, View, useColorScheme} from 'react-native';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {ChallengeModal} from './ChallengeModal.js';
import {Colors, SEARCHABLE_DATA} from '../const.js';
import {RModal, RText, sharedStyles} from '../ui.js';
import {getItemRarityColor} from '../util.js';
import IMAGES from '../../imgs/images.js';

export const ItemModal = ({itemName, modalVisible, setModalVisible}) => {
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const item = SEARCHABLE_DATA.items[itemName];
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return item ? (
    <RModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
      <View style={sharedStyles.itemModalHeader}>
        <View
          style={[
            sharedStyles.itemModalHeaderInfo,
            Platform.OS !== 'ios'
              ? sharedStyles.itemModalHeaderInfoNoOverflow
              : {},
          ]}>
          <RText
            style={[
              sharedStyles.itemModalHeaderRow,
              sharedStyles.ModalName,
              {color: getItemRarityColor(item)},
            ]}>
            {item.name}
          </RText>
          <RText
            style={[
              sharedStyles.itemModalHeaderRow,
              sharedStyles.itemModalHeaderText,
            ]}>
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
            <View style={[sharedStyles.itemModalHeaderRow]}>
              <RText style={[sharedStyles.itemModalHeaderText]}>
                Unlocked by{' '}
                <RText
                  style={[sharedStyles.achievementNameLink]}
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
          style={
            Platform.OS === 'ios'
              ? sharedStyles.itemModalHeaderImage
              : sharedStyles.itemModalHeaderImageNoOverflow
          }
        />
      </View>
      <RText color="secondary" style={sharedStyles.itemModalFlavor}>
        {'\u201c'}
        {item.flavorText}
        {'\u201d'}
      </RText>
      <RText style={sharedStyles.itemModalDescription}>
        {item.description}
      </RText>
      {item.stats ? (
        <>
          <RText style={sharedStyles.itemModalStatHeader}>Stats</RText>
          <View style={sharedStyles.itemModalStatRow}>
            <View
              style={[
                sharedStyles.itemModalStatCell,
                sharedStyles.itemModalStatName,
              ]}>
              <View
                style={[
                  sharedStyles.itemModalStatLabelWrapper,
                  {
                    borderBottomColor:
                      colorScheme === 'dark'
                        ? DarkTheme.colors.text
                        : Colors.black,
                  },
                ]}>
                <RText style={[sharedStyles.itemModalStatLabel]}>Stat</RText>
              </View>
              <RText style={sharedStyles.itemModalStatText}>
                {item.stats.map((stat) => stat.stat).join('\n')}
              </RText>
            </View>
            <View style={[sharedStyles.itemModalStatCell]}>
              <View
                style={[
                  sharedStyles.itemModalStatLabelWrapper,
                  {
                    borderBottomColor:
                      colorScheme === 'dark'
                        ? DarkTheme.colors.text
                        : Colors.black,
                  },
                ]}>
                <RText style={[sharedStyles.itemModalStatLabel]}>Value</RText>
              </View>
              <RText style={sharedStyles.itemModalStatText}>
                {item.stats.map((stat) => stat.value).join('\n')}
              </RText>
            </View>
            <View style={[sharedStyles.itemModalStatCell]}>
              <View
                style={[
                  sharedStyles.itemModalStatLabelWrapper,
                  {
                    borderBottomColor:
                      colorScheme === 'dark'
                        ? DarkTheme.colors.text
                        : Colors.black,
                  },
                ]}>
                <RText style={[sharedStyles.itemModalStatLabel]}>
                  Stacking
                </RText>
              </View>
              <RText style={sharedStyles.itemModalStatText}>
                {item.stats.map((stat) => stat.stack).join('\n')}
              </RText>
            </View>
            <View style={[sharedStyles.itemModalStatCell]}>
              <View
                style={[
                  sharedStyles.itemModalStatLabelWrapper,
                  {
                    borderBottomColor:
                      colorScheme === 'dark'
                        ? DarkTheme.colors.text
                        : Colors.black,
                  },
                ]}>
                <RText style={[sharedStyles.itemModalStatLabel]}>Add</RText>
              </View>
              <RText style={sharedStyles.itemModalStatText}>
                {item.stats.map((stat) => stat.add).join('\n')}
              </RText>
            </View>
          </View>
        </>
      ) : null}
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </RModal>
  ) : null;
};
