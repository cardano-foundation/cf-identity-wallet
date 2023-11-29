import { StateCacheProps } from "../../store/reducers/stateCache";
import { SeedPhraseCacheProps } from "../../store/reducers/seedPhraseCache";

interface PageState {
  [key: string]: any;
}
interface PayloadProps {
  [key: string]: any;
}
interface StoreState {
  stateCache: StateCacheProps;
  seedPhraseCache?: SeedPhraseCacheProps;
}
interface DataProps {
  store: StoreState;
  state?: PageState;
  payload?: PayloadProps;
}

export type { PageState, PayloadProps, StoreState, DataProps };
