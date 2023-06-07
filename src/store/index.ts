import { configureStore } from "@reduxjs/toolkit";
import { seedPhraseCacheSlice } from "./reducers/seedPhraseCache";
import { stateCacheSlice } from "./reducers/stateCache";
import { didsCacheSlice } from "./reducers/didsCache";

const store = configureStore({
  reducer: {
    stateCache: stateCacheSlice.reducer,
    seedPhraseCache: seedPhraseCacheSlice.reducer,
    didsCache: didsCacheSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
