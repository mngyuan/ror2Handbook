import {Colors} from './const.js';

export const getItemRarityColor = (item) =>
  item.rarity
    ? item.rarity.includes('Boss')
      ? Colors.rarityBoss
      : item.rarity.includes('Equipment')
      ? Colors.rarityEquipment
      : Colors[`rarity${item.rarity}`]
    : null;
