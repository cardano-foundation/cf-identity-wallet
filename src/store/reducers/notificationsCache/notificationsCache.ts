import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KeriaNotification } from "../../../core/agent/agent.types";
import { RootState } from "../../index";
import {
  NotificationCacheState
} from "./notificationCache.types";

const initialState: NotificationCacheState = {
  notifications: [],
};

const notificationsCacheSlice = createSlice({
  name: "notificationsCache",
  initialState,
  reducers: {
    markNotificationAsRead: (
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
    deleteNotificationById: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setNotificationsCache: (
      state,
      action: PayloadAction<KeriaNotification[]>
    ) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<KeriaNotification>) => {
      state.notifications = [action.payload, ...state.notifications];
    },
  },
});

export { initialState, notificationsCacheSlice };

export const {
  setNotificationsCache,
  markNotificationAsRead,
  deleteNotificationById,
  addNotification,
} = notificationsCacheSlice.actions;

const getNotificationsCache = (state: RootState) =>
  state.notificationsCache.notifications;

export { getNotificationsCache };
