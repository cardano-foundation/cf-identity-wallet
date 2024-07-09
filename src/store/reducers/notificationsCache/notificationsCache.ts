import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { KeriaNotification } from "../../../core/agent/agent.types";

const initialState: {
  notifications: KeriaNotification[];
} = {
  notifications: [],
};
const notificationsCacheSlice = createSlice({
  name: "notificationsCache",
  initialState,
  reducers: {
    setNotificationsCache: (
      state,
      action: PayloadAction<KeriaNotification[]>
    ) => {
      state.notifications = action.payload;
    },
  },
});

export { initialState, notificationsCacheSlice };

export const { setNotificationsCache } = notificationsCacheSlice.actions;

const getNotificationsCache = (state: RootState) =>
  state.notificationsCache.notifications;

export { getNotificationsCache };
