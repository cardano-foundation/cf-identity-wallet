import { configureStore } from "@reduxjs/toolkit";
import { seedPhraseCacheSlice } from "./reducers/seedPhraseCache";
import { stateCacheSlice } from "./reducers/stateCache";
import { identitiesCacheSlice } from "./reducers/identitiesCache";
import { credsCacheSlice } from "./reducers/credsCache";
import { cryptoAccountsCacheSlice } from "./reducers/cryptoAccountsCache";

const store = configureStore({
  reducer: {
    stateCache: stateCacheSlice.reducer,
    seedPhraseCache: seedPhraseCacheSlice.reducer,
    identitiesCache: identitiesCacheSlice.reducer,
    credsCache: credsCacheSlice.reducer,
    cryptoAccountsCache: cryptoAccountsCacheSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
