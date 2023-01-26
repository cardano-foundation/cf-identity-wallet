import {createSelector} from 'reselect';

const getState = (state) => state;

export const getAccount = createSelector(getState, (state) => state.account);
export const getIsDarkTheme = createSelector(
    getState,
    (state) => state.settings.darkTheme
);
export const getLanguage = createSelector(
    getState,
    (state) => state.settings.language
);
