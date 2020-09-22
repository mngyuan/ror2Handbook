import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import analytics from '@react-native-firebase/analytics';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './AsyncStorageProvider.js';
import {ChallengeModal} from './ChallengeModal.js';
import {
  Brand,
  Colors,
  FontSize,
  FontStyles,
  SEARCHABLE_DATA,
} from '../const.js';
import {RText, sharedStyles} from '../ui.js';
import IMAGES from '../../imgs/images.js';

export const DetailScreen = ({route}) => {
  const systemColorScheme = useColorScheme();
  const [viewingChallenge, setViewingChallenge] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;
  const {itemName} = route.params;
  const survivor = SEARCHABLE_DATA.survivors[itemName] || {};

  useEffect(() => {
    if (itemName) {
      analytics().logViewItem({
        items: [{item_name: itemName, item_category: 'survivor'}],
      });
    }
  }, [itemName]);

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

  return (
    <ScrollView>
      <View
        style={[
          styles.DetailScreen,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? DarkTheme.colors.background
                : Colors.white,
          },
        ]}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderInfo}>
            <RText style={styles.detailSectionHeader}>{survivor.name}</RText>
            {survivor.stats.Unlock ? (
              <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
                Unlocked by{' '}
                <RText
                  style={sharedStyles.achievementNameLink}
                  onPress={() => {
                    setViewingChallenge(survivor.stats.Unlock);
                    setChallengeModalVisible(true);
                  }}>
                  {survivor.stats.Unlock}
                </RText>
              </RText>
            ) : null}
            {survivor.description ? (
              <RText style={[sharedStyles.bodyText, {marginBottom: 4}]}>
                {survivor.description}
              </RText>
            ) : null}
          </View>
          <Image
            source={IMAGES[survivor.name.replace(/ /g, '')]}
            style={styles.detailHeaderImage}
          />
        </View>
        {Object.entries(survivor.stats).length > 0 ? (
          <>
            <RText style={[styles.detailSectionHeader]}>Stats</RText>
            <View style={styles.detailStats}>
              {Object.entries(survivor.stats)
                .filter(([k]) => !['Unlock'].includes(k))
                .map(([k, v]) => (
                  <RText style={styles.detailStat} key={k}>
                    <RText style={styles.detailStatLabel}>{k}</RText> {v}
                  </RText>
                ))}
            </View>
          </>
        ) : null}
        {survivor.skills && survivor.skills.length > 0 ? (
          <>
            <RText style={[styles.detailSectionHeader]}>Skills</RText>
            {survivor.skills.map((skill) => (
              <View style={styles.detailSkillRow} key={skill.name}>
                <View style={styles.detailSkillInfo}>
                  <RText style={styles.detailSkillHeader}>
                    <RText style={styles.detailSkillName}>{skill.name}</RText>
                    <RText> {skill.Type}</RText>
                    {skill.Cooldown ? <RText>, {skill.Cooldown}</RText> : null}
                  </RText>
                  {skill.Notes && skill.Notes.includes('Unlock') ? (
                    <RText
                      style={[sharedStyles.bodyText, styles.detailSkillUnlock]}>
                      Unlocked by{' '}
                      <RText
                        style={sharedStyles.achievementNameLink}
                        onPress={() => {
                          const unlock = skill.Notes.match(
                            /Unlocked via the (.*) Challenge\./,
                          )[1];
                          setViewingChallenge(unlock);
                          setChallengeModalVisible(true);
                        }}>
                        {
                          skill.Notes.match(
                            /Unlocked via the (.*) Challenge\./,
                          )[1]
                        }
                      </RText>
                    </RText>
                  ) : null}
                  <RText
                    style={[
                      sharedStyles.bodyText,
                      styles.detailSkillDescription,
                    ]}>
                    {skill.Description.replace(/\n/g, '')}
                  </RText>
                  {skill['Proc Coefficient'] ? (
                    <RText style={styles.detailStat}>
                      <RText style={styles.detailStatLabel}>
                        Proc Coefficient{' '}
                      </RText>
                      {skill['Proc Coefficient']}
                    </RText>
                  ) : null}
                </View>
                <Image
                  source={
                    IMAGES[skill.name.replace(/ /g, '')] ||
                    IMAGES[skill.name.replace(/ |:/g, '')]
                  }
                  style={styles.detailSkillImage}
                />
              </View>
            ))}
          </>
        ) : null}
      </View>
      <ChallengeModal
        challengeName={viewingChallenge}
        modalVisible={challengeModalVisible}
        setModalVisible={() => setChallengeModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  DetailScreen: {
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailHeaderInfo: {flex: 1, marginRight: 8},
  detailSectionHeader: {
    fontSize: FontSize.heading,
    ...FontStyles.bold,
    marginBottom: 4,
  },
  detailHeaderImage: {
    width: '45%',
    aspectRatio: 1,
  },
  detailStats: {
    marginBottom: 24,
  },
  detailStat: {
    fontSize: FontSize.monospace,
    fontFamily: Brand.monospaceFont,
  },
  detailStatLabel: {
    ...FontStyles.boldMono,
  },
  detailAchievementNameLink: {},
  detailSkillRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  detailSkillImage: {
    width: 80,
    aspectRatio: 1,
  },
  detailSkillInfo: {
    flex: 1,
    marginRight: 8,
  },
  detailSkillHeader: {
    fontSize: FontSize.subheading,
  },
  detailSkillUnlock: {
    marginBottom: 4,
  },
  detailSkillName: {
    ...FontStyles.bold,
  },
  detailSkillDescription: {
    marginTop: 4,
    marginBottom: 4,
  },
});
