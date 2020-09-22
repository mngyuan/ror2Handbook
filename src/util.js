import {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {Colors} from './const.js';

export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  const handleAppStateChange = (nextAppState) => setAppState(nextAppState);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return appState;
};

export const getItemRarityColor = (item) =>
  item.rarity
    ? item.rarity.includes('Boss')
      ? Colors.rarityBoss
      : item.rarity.includes('Equipment')
      ? Colors.rarityEquipment
      : Colors[`rarity${item.rarity}`]
    : null;
