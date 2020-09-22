import React, {useContext, useState} from 'react';
import {ScrollView, Text, View, useColorScheme} from 'react-native';
import {DarkTheme} from '@react-navigation/native';
import {AsyncStorageContext} from './components/AsyncStorageProvider.js';
import {Brand, Colors} from './const';

export const RText = ({color = 'primary', style, children, ...props}) => {
  const systemColorScheme = useColorScheme();
  const {data: asyncStorageData} = useContext(AsyncStorageContext);

  const colorScheme = asyncStorageData?.dark_mode_override
    ? 'dark'
    : systemColorScheme;
  const primaryColor =
    colorScheme === 'dark' ? DarkTheme.colors.text : Colors.black;
  const secondaryColor =
    colorScheme === 'dark' ? 'rgb(170, 170, 172)' : Colors.darkGrey;
  const textColor = color === 'primary' ? primaryColor : secondaryColor;

  return (
    <Text
      style={[{color: textColor, fontFamily: Brand.defaultFont}, style]}
      {...props}>
      {children}
    </Text>
  );
};

export const VerticalSwipeView = ({
  onSwipeDown = () => {},
  style,
  children,
}) => {
  const [offset, setOffset] = useState(0);
  return (
    <ScrollView
      onScroll={(e) => {
        const offset = e.nativeEvent.contentOffset.y;
        setOffset(offset);
      }}
      onResponderRelease={() => {
        if (offset > -50) {
          return;
        }
        onSwipeDown();
      }}
      scrollEventThrottle={50}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{overflow: 'visible'}}>
      <View onStartShouldSetResponder={() => true} style={style}>
        {children}
      </View>
    </ScrollView>
  );
};
