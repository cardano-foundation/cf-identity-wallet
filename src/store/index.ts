import { configureStore } from "@reduxjs/toolkit";
import { seedPhraseCacheSlice } from "./reducers/SeedPhraseCache";
import { stateCacheSlice } from "./reducers/StateCache";

const store = configureStore({
  reducer: {
    stateCache: stateCacheSlice.reducer,
    seedPhraseCache: seedPhraseCacheSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
