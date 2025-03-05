import { configureStore } from "@reduxjs/toolkit";
import { stateCacheSlice } from "./reducers/stateCache";

const store = configureStore({
  reducer: stateCacheSlice.reducer,
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { AppDispatch, RootState };

export { store };
