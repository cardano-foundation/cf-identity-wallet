import { configureStore } from "@reduxjs/toolkit";
import seedPhraseCache from "./reducers/SeedPhraseCache";

const store = configureStore({
  reducer: {
    seedPhraseCache,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };

export { store };
