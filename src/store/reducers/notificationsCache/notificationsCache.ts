import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { KeriaNotification } from "../../../core/agent/agent.types";
import {
  NotificationCacheState,
  NotificationDetailCacheState,
} from "./notificationCache.types";

const initialState: NotificationCacheState = {
  notifications: [],
  notificationDetailCache: null,
};

const notificationsCacheSlice = createSlice({
  name: "notificationsCache",
  initialState,
  reducers: {
    setReadedNotification: (
      state,
      action: PayloadAction<{
        id: string;
        read: boolean;
      }>
    ) => {
      state.notifications = state.notifications.map((notification) => {
        if (notification.id !== action.payload.id) return notification;

        return {
          ...notification,
          read: action.payload.read,
        };
      });
    },
    deleteNotification: (state, action: PayloadAction<KeriaNotification>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.id
      );
    },
    setNotificationsCache: (
      state,
      action: PayloadAction<KeriaNotification[]>
    ) => {
      state.notifications = action.payload;
    },
    setNotificationDetailCache: (
      state,
      action: PayloadAction<NotificationDetailCacheState | null>
    ) => {
      state.notificationDetailCache = action.payload;
    },
  },
});

export { initialState, notificationsCacheSlice };

export const {
  setNotificationsCache,
  setReadedNotification,
  deleteNotification,
  setNotificationDetailCache,
} = notificationsCacheSlice.actions;

const getNotificationsCache = (state: RootState) =>
  state.notificationsCache.notifications;

const getNotificationDetailCache = (state: RootState) =>
  state.notificationsCache.notificationDetailCache;

export { getNotificationsCache, getNotificationDetailCache };
