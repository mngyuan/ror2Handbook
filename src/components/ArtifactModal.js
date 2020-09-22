import React, {useContext} from 'react';
import {Image, StyleSheet, View, useColorScheme} from 'react-native';
import Modal from 'react-native-modal';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {Colors, FontSize, FontStyles, SEARCHABLE_DATA} from '../const.js';
import {RText, VerticalSwipeView} from '../ui.js';
import IMAGES from '../../imgs/images.js';

export const ArtifactModal = ({
  artifactName,
  modalVisible,
  setModalVisible,
}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const artifact = SEARCHABLE_DATA.artifacts[artifactName];
  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;

  return artifact ? (
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
            <RText style={[styles.itemModalHeaderRow, styles.ModalName]}>
              {artifact.name}
            </RText>
          </View>
          <Image
            source={IMAGES[artifact.name.replace(/ /g, '')]}
            style={styles.itemModalHeaderImage}
          />
        </View>
        <RText style={[styles.artifactCode]}>
          {artifact.code.slice(0, 3).split('').join(' ')}
          {'\n'}
          {artifact.code.slice(3, 6).split('').join(' ')}
          {'\n'}
          {artifact.code.slice(6).split('').join(' ')}
        </RText>
        <RText style={[styles.bodyText, {marginBottom: 4}]}>
          {artifact.description}
        </RText>
      </VerticalSwipeView>
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
  artifactCode: {
    ...FontStyles.boldMono,
    textAlign: 'center',
    marginBottom: 16,
  },
});
