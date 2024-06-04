import { configureStore } from "@reduxjs/toolkit";
import { seedPhraseCacheSlice } from "./reducers/seedPhraseCache";
import { stateCacheSlice } from "./reducers/stateCache";
import { identifiersCacheSlice } from "./reducers/identifiersCache";
import { credsCacheSlice } from "./reducers/credsCache";
import { connectionsCacheSlice } from "./reducers/connectionsCache";
import { walletConnectionsCacheSlice } from "./reducers/walletConnectionsCache";
import {
  getIdentifierViewTypeCacheCache,
  identifierViewTypeCacheSlice,
} from "./reducers/identifierViewTypeCache";
import { biometryCacheSlice } from "./reducers/biometryCache";
import { credsArchivedSlice } from "./reducers/credsArchived";

const store = configureStore({
  reducer: {
    stateCache: stateCacheSlice.reducer,
    seedPhraseCache: seedPhraseCacheSlice.reducer,
    identifiersCache: identifiersCacheSlice.reducer,
    credsCache: credsCacheSlice.reducer,
    credsArchived: credsArchivedSlice.reducer,
    connectionsCache: connectionsCacheSlice.reducer,
    walletConnectionsCache: walletConnectionsCacheSlice.reducer,
    identifierViewTypeCacheCache: identifierViewTypeCacheSlice.reducer,
    biometryCache: biometryCacheSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
