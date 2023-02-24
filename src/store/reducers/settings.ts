import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

export interface ISettingsState {
  theme: string;
  isDarkMode: boolean;
  language: string;
  network: string;
  isExtension: boolean;
}

const initialState: ISettingsState = {
  theme: 'dark',
  isDarkMode: false,
  language: 'en',
  network: 'preprod',
  isExtension: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<ISettingsState>) => {
      state.theme = action.payload.theme;
      state.isDarkMode = action.payload.isDarkMode;
      state.language = action.payload.language;
      state.network = action.payload.network;
      state.isExtension = action.payload.isExtension;
    },
    setTheme: (state, action: PayloadAction<ISettingsState>) => {
      state.theme = action.payload.theme;
    },
    setIsDarkMode: (state, action: PayloadAction<ISettingsState>) => {
      state.isDarkMode = action.payload.isDarkMode;
    },
    setLanguage: (state, action: PayloadAction<ISettingsState>) => {
      state.language = action.payload.language;
    },
    setNetwork: (state, action: PayloadAction<ISettingsState>) => {
      state.network = action.payload.network;
    },
    setIsExtension: (state, action: PayloadAction<ISettingsState>) => {
      state.isExtension = action.payload.isExtension;
    },
  },
});

export const {setSettings, setTheme, setIsDarkMode, setLanguage, setNetwork, setIsExtension} =
  settingsSlice.actions;

export const getSettings = (state: RootState) => state.settings;
export const getTheme = (state: RootState) => state.settings.theme;
export const getIsDarkMode = (state: RootState) => state.settings.isDarkMode;
export const getLanguage = (state: RootState) => state.settings.language;
export const getNetwork = (state: RootState) => state.settings.network;
export const getIsExtension = (state: RootState) => state.settings.isExtension;

export default settingsSlice.reducer;
