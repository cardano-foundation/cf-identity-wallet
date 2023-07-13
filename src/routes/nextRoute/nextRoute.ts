import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState, store as storeState } from "../../store";
import {
  getState,
  removeSetPasscodeRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import {
  clearSeedPhraseCache,
  setSeedPhraseCache,
} from "../../store/reducers/seedPhraseCache";
import { DataProps } from "./nextRoute.types";
import { RoutePath, TabsRoutePath } from "../paths";
import { backPath } from "../backRoute";
import { useAppSelector } from "../../store/hooks";

const getNextRootRoute = () => {
  const store = storeState.getState();
  const authentication = store.stateCache.authentication;
  const routes = store.stateCache.routes;
  const initialRoute =
    routes.some((route) => route.path === "/") || routes.length === 0;

  let path;
  if (authentication.passcodeIsSet && !authentication.loggedIn) {
    path = RoutePath.PASSCODE_LOGIN;
  } else if (authentication.seedPhraseIsSet) {
    path = RoutePath.TABS_MENU;
  } else {
    if (initialRoute) {
      path = RoutePath.ONBOARDING;
    } else {
      path = routes[0].path;
    }
  }

  return { pathname: path };
};
const getNextOnboardingRoute = () => {
  const store = storeState.getState();
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase160;

  let path;
  if (!store.stateCache.authentication.passcodeIsSet) {
    path = RoutePath.SET_PASSCODE;
  } else if (store.stateCache.authentication.passcodeIsSet && seedPhraseIsSet) {
    path = RoutePath.TABS_MENU;
  } else {
    path = RoutePath.GENERATE_SEED_PHRASE;
  }

  return { pathname: path };
};

const getNextCreateCryptoAccountRoute = () => {
  const path = RoutePath.GENERATE_SEED_PHRASE;
  return { pathname: path };
};

const getNextSetPasscodeRoute = () => {
  const store = storeState.getState();
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase160;

  const nextPath: string = seedPhraseIsSet
    ? RoutePath.TABS_MENU
    : RoutePath.GENERATE_SEED_PHRASE;

  return { pathname: nextPath };
};

const updateStoreAfterSetPasscodeRoute = () => {
  const store = storeState.getState();
  return setAuthentication({
    ...store.stateCache.authentication,
    loggedIn: true,
    time: Date.now(),
    passcodeIsSet: true,
  });
};
const updateStoreAfterVerifySeedPhraseRoute = () => {
  const store = storeState.getState();
  return setAuthentication({
    ...store.stateCache.authentication,
    seedPhraseIsSet: true,
  });
};

const getNextGenerateSeedPhraseRoute = () => {
  return { pathname: RoutePath.VERIFY_SEED_PHRASE };
};
const getNextVerifySeedPhraseRoute = () => {
  return { pathname: RoutePath.TABS_MENU };
};

const updateStoreSetSeedPhrase = (data: DataProps) => {
  return setSeedPhraseCache({
    seedPhrase160: data.state?.seedPhrase160,
    seedPhrase256: data.state?.seedPhrase256,
    selected: data.state?.selected,
  });
};
const updateStoreCurrentRoute = (data: DataProps) => {
  return setCurrentRoute({ path: data.state?.nextRoute });
};

const getNextCreatePasswordRoute = () => {
  const backRoute = backPath();
  return { pathname: backRoute.pathname };
};
const updateStoreAfterCreatePassword = () => {
  const store = storeState.getState();
  return setAuthentication({
    ...store.stateCache.authentication,
    passwordIsSet: true,
  });
};

const getNextRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string };
  updateRedux: ((
    data: DataProps
  ) => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { nextPath, updateRedux } = NextRoute[currentPath];
  updateRedux.push(updateStoreCurrentRoute);
  return {
    nextPath: nextPath(data),
    updateRedux,
  };
};

const NextRoute: Record<string, any> = {
  [RoutePath.ROOT]: {
    nextPath: () => getNextRootRoute(),
    updateRedux: [],
  },
  [RoutePath.ONBOARDING]: {
    nextPath: () => getNextOnboardingRoute(),
    updateRedux: [],
  },
  [RoutePath.SET_PASSCODE]: {
    nextPath: () => getNextSetPasscodeRoute(),
    updateRedux: [removeSetPasscodeRoute, updateStoreAfterSetPasscodeRoute],
  },
  [RoutePath.GENERATE_SEED_PHRASE]: {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [updateStoreSetSeedPhrase],
  },
  [RoutePath.VERIFY_SEED_PHRASE]: {
    nextPath: () => getNextVerifySeedPhraseRoute(),
    updateRedux: [updateStoreAfterVerifySeedPhraseRoute, clearSeedPhraseCache],
  },
  [RoutePath.CREATE_PASSWORD]: {
    nextPath: () => getNextCreatePasswordRoute(),
    updateRedux: [updateStoreAfterCreatePassword],
  },
  [TabsRoutePath.CRYPTO]: {
    nextPath: () => getNextCreateCryptoAccountRoute(),
    updateRedux: [],
  },
};

export {
  getNextRootRoute,
  getNextRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextGenerateSeedPhraseRoute,
  getNextVerifySeedPhraseRoute,
  updateStoreCurrentRoute,
  updateStoreSetSeedPhrase,
  updateStoreAfterVerifySeedPhraseRoute,
  getNextCreatePasswordRoute,
  updateStoreAfterCreatePassword,
};
