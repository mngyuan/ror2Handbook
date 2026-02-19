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
  const unlocks = challenge?.unlock
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return challenge ? (
    <RModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
      <RText
        style={[
          sharedStyles.ModalName,
          sharedStyles.itemModalHeaderRow,
          {color: Colors.achievementColor},
        ]}
      >
        {challenge.name}
      </RText>
      <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
        {challenge.description}
      </RText>
      {unlocks.map((unlock, i) => (
        <View
          key={`${challenge.name}-${unlock}-${i}`}
          style={[
            {marginBottom: 4, flexDirection: 'row', alignItems: 'center'},
          ]}
        >
          {i === 0 ? (
            <RText style={[sharedStyles.bodyText]}>Unlocks </RText>
          ) : null}
          {IMAGES[unlock.replace(/ /g, '')] ? (
            <Image
              source={IMAGES[unlock.replace(/ /g, '')]}
              style={[styles.challengeModalUnlockImage]}
            />
          ) : null}
          <RText style={[sharedStyles.bodyText]}> </RText>
          <RText style={[sharedStyles.bodyText, sharedStyles.mediumText]}>
            {unlock}
          </RText>
          <RText style={[sharedStyles.bodyText]}>
            {i >= unlocks.length - 1 ? '.' : ','}
          </RText>
        </View>
      ))}
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
