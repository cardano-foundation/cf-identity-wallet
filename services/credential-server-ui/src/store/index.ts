import { configureStore } from "@reduxjs/toolkit";
import { stateCacheSlice } from "./reducers/stateCache";
import connectionsReducer from "./reducers/connectionsSlice";

const store = configureStore({
  reducer: {
    stateCache: stateCacheSlice.reducer,
    connections: connectionsReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { AppDispatch, RootState };

export { store };
