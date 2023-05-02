import { configureStore } from "@reduxjs/toolkit";
import { SeedPhraseCacheSlice } from "./reducers/SeedPhraseCache";
import { StateCacheSlice } from "./reducers/StateCache";

const store = configureStore({
  reducer: {
    stateCache: StateCacheSlice.reducer,
    seedPhraseCache: SeedPhraseCacheSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
