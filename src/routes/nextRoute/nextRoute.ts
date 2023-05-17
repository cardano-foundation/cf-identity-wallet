import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RoutePath } from "../index";
import { RootState } from "../../store";
import {
  removeSetPasscodeRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import {
  clearSeedPhraseCache, setSeedPhraseCache
} from "../../store/reducers/seedPhraseCache";
import { DataProps, PageState } from "./nextRoute.types";

const getNextRootRoute = (store: RootState) => {
  const authentication = store.stateCache.authentication;
  const routes = store.stateCache.routes;
  const initialRoute =
    routes.some((route) => route.path === "/") || routes.length === 0;

  let path;
  if (authentication.passcodeIsSet && !authentication.loggedIn) {
    path = RoutePath.PASSCODE_LOGIN;
  } else {
    if (initialRoute) {
      path = RoutePath.ONBOARDING;
    } else {
      path = routes[0].path;
    }
  }
  return { pathname: path };
};
const getNextOnboardingRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

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

const getNextSetPasscodeRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

  const nextPath: string = seedPhraseIsSet
    ? RoutePath.TABS_MENU
    : RoutePath.GENERATE_SEED_PHRASE;

  return { pathname: nextPath };
};

const updateStoreAfterSetPasscodeRoute = (data: DataProps) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    loggedIn: true,
    time: Date.now(),
    passcodeIsSet: true,
  });
};

const getNextPasscodeLoginRoute = (
  store: RootState,
  state: PageState | undefined
) => {
  const seedPhraseISet = !!store.seedPhraseCache.seedPhrase;
  if (state?.resetPasscode && seedPhraseISet) {
    return { pathname: RoutePath.VERIFY_SEED_PHRASE };
  } else if (state?.resetPasscode) {
    return { pathname: RoutePath.SET_PASSCODE };
  } else {
    const routesIncludeOnboarding = store.stateCache.routes.some(
      (route) => route.path === RoutePath.ONBOARDING
    );
    let nextPath;
    if (routesIncludeOnboarding && store.stateCache.routes.length === 1) {
      nextPath = RoutePath.ONBOARDING;
    } else {
      nextPath = RoutePath.GENERATE_SEED_PHRASE;
    }

    return { pathname: nextPath };
  }
};

const getNextGenerateSeedPhraseRoute = () => {
  return { pathname: RoutePath.VERIFY_SEED_PHRASE };
};
const getNextVerifySeedPhraseRoute = () => {
  return { pathname: RoutePath.TABS_MENU };
};

const updateStoreAfterPasscodeLoginRoute = (data: DataProps) => {
  const seedPhraseISet = !!data.store.seedPhraseCache.seedPhrase;

  if (data.state?.resetPasscode && seedPhraseISet) {
    return setAuthentication({
      ...data.store.stateCache.authentication,
      loggedIn: false,
      time: 0,
    });
  } else if (data.state?.resetPasscode) {
    return setAuthentication({
      ...data.store.stateCache.authentication,
      loggedIn: false,
      time: 0,
    });
  } else {
    return setAuthentication({
      ...data.store.stateCache.authentication,
      loggedIn: true,
      time: Date.now(),
    });
  }
};

const updateStoreSetSeedPhrase = (data: DataProps) => {
  return setSeedPhraseCache(data.state?.seedPhrase);
};
const updateStoreCurrentRoute = (data: DataProps) => {
  return setCurrentRoute({ path: data.state?.nextRoute });
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
  "/": {
    nextPath: (data: DataProps) => getNextRootRoute(data.store),
    updateRedux: [],
  },
  "/onboarding": {
    nextPath: (data: DataProps) => getNextOnboardingRoute(data.store),
    updateRedux: [],
  },
  "/setpasscode": {
    nextPath: (data: DataProps) => getNextSetPasscodeRoute(data.store),
    updateRedux: [removeSetPasscodeRoute, updateStoreAfterSetPasscodeRoute],
  },
  "/passcodelogin": {
    nextPath: (data: DataProps) =>
      getNextPasscodeLoginRoute(data.store, data.state),
    updateRedux: [updateStoreAfterPasscodeLoginRoute],
  },
  "/generateseedphrase": {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [updateStoreSetSeedPhrase],
  },
  "/verifyseedphrase": {
    nextPath: () => getNextVerifySeedPhraseRoute(),
    updateRedux: [clearSeedPhraseCache],
  },
};

export {
  getNextRootRoute,
  getNextRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextPasscodeLoginRoute,
  updateStoreAfterPasscodeLoginRoute,
  getNextGenerateSeedPhraseRoute,
  getNextVerifySeedPhraseRoute,
  updateStoreCurrentRoute,
  updateStoreSetSeedPhrase
};
