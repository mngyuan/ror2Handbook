import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {FontStyles, SEARCHABLE_DATA} from '../const.js';
import {RModal, RText, sharedStyles} from '../ui.js';
import IMAGES from '../../imgs/images.js';

export const ArtifactModal = ({
  artifactName,
  modalVisible,
  setModalVisible,
}) => {
  const artifact = SEARCHABLE_DATA.artifacts[artifactName];

  return artifact ? (
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
            style={[sharedStyles.itemModalHeaderRow, sharedStyles.ModalName]}>
            {artifact.name}
          </RText>
        </View>
        <Image
          source={IMAGES[artifact.name.replace(/ /g, '')]}
          style={
            Platform.OS === 'ios'
              ? sharedStyles.itemModalHeaderImage
              : sharedStyles.itemModalHeaderImageNoOverflow
          }
        />
      </View>
      <RText style={[styles.artifactCode]}>
        {artifact.code.slice(0, 3).split('').join(' ')}
        {'\n'}
        {artifact.code.slice(3, 6).split('').join(' ')}
        {'\n'}
        {artifact.code.slice(6).split('').join(' ')}
      </RText>
      <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
        {artifact.description}
      </RText>
    </RModal>
  ) : null;
};

const styles = StyleSheet.create({
  artifactCode: {
    ...FontStyles.boldMono,
    textAlign: 'center',
    marginBottom: 16,
  },
});
