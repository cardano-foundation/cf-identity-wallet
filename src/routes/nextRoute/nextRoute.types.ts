import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { SeedPhraseCacheProps } from "../../store/reducers/seedPhraseCache";
import { StateCacheProps } from "../../store/reducers/stateCache";
import { RoutePath, TabsRoutePath } from "../paths";

type PageDefaultState = Record<string, string | boolean | undefined>;

interface RecoveryWalletProgressState {
  recoveryWalletProgress: boolean;
}

interface SeedPhraseCacheState {
  seedPhrase?: string;
  bran?: string;
}

interface RouteState {
  nextRoute: string;
}

interface PasswordState {
  skipped: boolean;
}

interface StoreState {
  stateCache: StateCacheProps;
  seedPhraseCache?: SeedPhraseCacheProps;
}

interface NextRoute {
  nextPath: (data: DataProps) => {
    pathname: RoutePath | TabsRoutePath | string;
  };
  updateRedux: UpdateRedux[];
}

interface DataProps<S = PageDefaultState, P = object> {
  store: StoreState;
  state?: S;
  payload?: P;
}

type UpdateRedux = ((data: DataProps<unknown>) => AnyAction) | (() => AnyAction) | ((data: DataProps) => AnyAction) | ((data: DataProps) => ThunkAction<void, RootState, undefined, AnyAction>);

export type { DataProps, NextRoute, PageDefaultState, PasswordState, RecoveryWalletProgressState, RouteState, SeedPhraseCacheState, StoreState, UpdateRedux };

