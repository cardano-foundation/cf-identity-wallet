import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from "../store";

export interface ISettingsState {
    theme: string,
    language: string,
    network: string
}

const initialState: ISettingsState = {
    theme: 'dark',
    language: 'en',
    network: 'preprod',
};

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action: PayloadAction<ISettingsState>) => {
            state.theme = action.payload.theme;
            state.language = action.payload.language;
            state.network = action.payload.network;
        },
        setTheme: (state, action: PayloadAction<ISettingsState>) => {
            state.theme = action.payload.theme;
        },
        setLanguage: (state, action: PayloadAction<ISettingsState>) => {
            state.language = action.payload.language;
        },
        setNetwork: (state, action: PayloadAction<ISettingsState>) => {
            state.network = action.payload.network;
        },
    }
});

export const {setSettings, setTheme, setLanguage, setNetwork} = settingsSlice.actions;

export const getSettings = (state: RootState) => state.settings;
export const getTheme = (state: RootState) => state.settings.theme;
export const getLanguage = (state: RootState) => state.settings.language;
export const getNetwork = (state: RootState) => state.settings.network;

export default settingsSlice.reducer;
