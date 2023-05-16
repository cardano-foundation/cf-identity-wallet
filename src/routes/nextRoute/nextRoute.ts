import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RoutePath } from "../index";
import { RootState } from "../../store";
import {
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import {
  clearSeedPhraseCache,
  setSeedPhraseCache,
} from "../../store/reducers/seedPhraseCache";
import { DataProps, PageState } from "./nextRoute.types";

const getNextRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { nextPath, updateRedux } = NextRoute[currentPath];
  const path = nextPath(data);
  updateRedux.push(() => () => setCurrentRoute({ path: path.pathname }));
  return {
    nextPath: path,
    updateRedux: updateRedux.map((fn: (data: DataProps) => void) => fn(data)),
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
    updateRedux: [
      (data: DataProps) => () => updateStoreAfterSetPasscodeRoute(data.store),
    ],
  },
  "/passcodelogin": {
    nextPath: (data: DataProps) =>
      getNextPasscodeLoginRoute(data.store, data.state),
    updateRedux: [
      (data: DataProps) => () =>
        updateStoreAfterPasscodeLoginRoute(data.store, data.state),
    ],
  },
  "/generateseedphrase": {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [
      (data: DataProps) => () => setSeedPhraseCache(data.state?.seedPhrase),
    ],
  },
  "/verifyseedphrase": {
    nextPath: () => getNextVerifySeedPhraseRoute(),
    updateRedux: [() => () => clearSeedPhraseCache()],
  },
};

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

const updateStoreAfterSetPasscodeRoute = (store: RootState) => {
  return setAuthentication({
    ...store.stateCache.authentication,
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

const updateStoreAfterPasscodeLoginRoute = (
  store: RootState,
  state: PageState | undefined
) => {
  const seedPhraseISet = !!store.seedPhraseCache.seedPhrase;

  if (state?.resetPasscode && seedPhraseISet) {
    return setAuthentication({
      ...store.stateCache.authentication,
      loggedIn: false,
      time: 0,
    });
  } else if (state?.resetPasscode) {
    return setAuthentication({
      ...store.stateCache.authentication,
      loggedIn: false,
      time: 0,
    });
  } else {
    return setAuthentication({
      ...store.stateCache.authentication,
      loggedIn: true,
      time: Date.now(),
    });
  }
};

const getNextGenerateSeedPhraseRoute = () => {
  return { pathname: RoutePath.VERIFY_SEED_PHRASE };
};
const getNextVerifySeedPhraseRoute = () => {
  return { pathname: RoutePath.TABS_MENU };
};

export {
  getNextRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextPasscodeLoginRoute,
  updateStoreAfterPasscodeLoginRoute,
  getNextGenerateSeedPhraseRoute,
  getNextVerifySeedPhraseRoute,
};
