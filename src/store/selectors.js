import { createSelector } from 'reselect';

const getState = (state) => state;

export const getRouter = createSelector(getState, (state) => state.router);
export const getLanguage = createSelector(
  getState,
  (state) => state.settings.language
);
export const getAccount = createSelector(getState, (state) => state.account);
export const getIsDarkTheme = createSelector(
  getState,
  (state) => state.settings.darkTheme
);

//  Chat: General getters
export const getContacts = createSelector(getState, (state) => state.contacts);
export const getChats = createSelector(getState, (state) => state.chats);

//  Chat: More specific getters
export const getChat = (contactId) =>
  createSelector(
    getState,
    (state) =>
      state.chats.filter(
        (c) => parseInt(c.contact_id) === parseInt(contactId)
      )[0].chats
  );
export const getContact = (contactId) =>
  createSelector(
    getState,
    (state) =>
      state.contacts.filter((c) => parseInt(c.id) === parseInt(contactId))[0]
  );
export const getChatNotificationCount = (contactId) =>
  createSelector(getState, (state) =>
    state.chats
      .filter((c) => parseInt(c.contact_id) === parseInt(contactId))[0]
      .chats.filter((chat) => chat.read === false)
  );
