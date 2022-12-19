import { createSelector } from 'reselect';

const getState = state => state;

export const getRouter = createSelector(getState, state => state.router);
export const getLanguage = createSelector(getState, state => state.settings.language);
export const getAccount = createSelector(getState, state => state.account);
export const getIsDarkTheme = createSelector(getState, state => state.settings.darkTheme);
