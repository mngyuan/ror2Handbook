import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Colors, NONSEARCHABLE_DATA} from '../const.js';
import {RModal, RText, sharedStyles} from '../ui.js';
import IMAGES from '../../imgs/images.js';

export const ChallengeModal = ({
  challengeName,
  modalVisible,
  setModalVisible,
}) => {
  const challenge = NONSEARCHABLE_DATA.challenges[challengeName];

  return challenge ? (
    <RModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
      <RText
        style={[
          sharedStyles.ModalName,
          sharedStyles.itemModalHeaderRow,
          {color: Colors.achievementColor},
        ]}>
        {challenge.name}
      </RText>
      <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
        {challenge.description}
      </RText>
      <View
        style={[
          {marginBottom: 4, flexDirection: 'row', alignItems: 'flex-end'},
        ]}>
        <RText style={[sharedStyles.bodyText]}>Unlocks </RText>
        <RText style={[sharedStyles.bodyText, sharedStyles.mediumText]}>
          {challenge.unlock}
        </RText>
        {IMAGES[challenge.unlock.replace(/ /g, '')] ? (
          <>
            <RText style={[sharedStyles.bodyText]}> </RText>
            <Image
              source={IMAGES[challenge.unlock.replace(/ /g, '')]}
              style={[styles.challengeModalUnlockImage]}
            />
            <RText style={[sharedStyles.bodyText]}> </RText>
          </>
        ) : null}
        <RText style={[sharedStyles.bodyText]}>.</RText>
      </View>
    </RModal>
  ) : null;
};

const styles = StyleSheet.create({
  challengeModalUnlockImage: {
    height: 48,
    // not sure why not setting width doesn't work but all our images (i think)
    // are square
    width: 48,
  },
});
