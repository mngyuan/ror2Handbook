import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export const AsyncStorageContext = React.createContext(defaultAsyncStorageData);
const ASYNC_STORAGE_KEYS = ['dark_mode_override'];
const defaultAsyncStorageData = {
  data: {},
  setAsyncStorageItem: () => Promise.resolve(),
};

const AsyncStorageProvider = ({children}) => {
  const [asyncStorageData, setAsyncStorageData] = useState({});

  const refreshAll = useCallback(async () => {
    const data = await Promise.all(
      ASYNC_STORAGE_KEYS.map(async (key) => [
        key,
        await AsyncStorage.getItem(key),
      ]),
    );
    setAsyncStorageData(
      Object.fromEntries(data.map(([k, v]) => [k, JSON.parse(v)])),
    );
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <AsyncStorageContext.Provider
      value={{
        data: asyncStorageData,
        setAsyncStorageItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
          setAsyncStorageData({...asyncStorageData, [key]: value});
        },
      }}>
      {children}
    </AsyncStorageContext.Provider>
  );
};

export default AsyncStorageProvider;
