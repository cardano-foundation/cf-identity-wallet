import { RootState } from "../../store";
import { Reducer } from "redux";
import { StateCacheProps } from "../../store/reducers/stateCache";
import { SeedPhraseCacheProps } from "../../store/reducers/seedPhraseCache";
import { IdentityShortDetails } from "../../core/aries/ariesAgent.types";
import { CredProps } from "../../ui/components/CardsStack/CardsStack.types";
import { CryptoAccountProps } from "../../ui/pages/Crypto/Crypto.types";

interface PageState {
  [key: string]: any;
}
interface PayloadProps {
  [key: string]: any;
}
interface StoreState {
  stateCache?: StateCacheProps;
  seedPhraseCache?: SeedPhraseCacheProps;
  identitiesCache?: { identities: IdentityShortDetails[] };
  credsCache?: { creds: CredProps[] };
  cryptoAccountsCache?: {
    cryptoAccounts: CryptoAccountProps[];
    defaultCryptoAccount: string;
    hideCryptoBalances: boolean;
  };
}
interface DataProps {
  store: StoreState;
  state?: PageState;
  payload?: PayloadProps;
}

export type { PageState, PayloadProps, StoreState, DataProps };
