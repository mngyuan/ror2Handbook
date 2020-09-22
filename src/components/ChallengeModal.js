import React from 'react';
import {Image, StyleSheet} from 'react-native';
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
      <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
        Unlocks{' '}
        <RText style={[sharedStyles.bodyText, sharedStyles.mediumText]}>
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
