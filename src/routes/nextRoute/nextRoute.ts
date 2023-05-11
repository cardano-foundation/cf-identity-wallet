import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RoutePaths } from "../index";
import { RootState } from "../../store";
import { setAuthentication } from "../../store/reducers/stateCache";
import { setSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import { DataProps, PageState, RouteRulesType } from "./nextRoute.types";

const getNextRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string; canNavigate: boolean };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { nextPath, updateRedux } = NextRoute[currentPath];

  return {
    nextPath: nextPath(data),
    updateRedux: updateRedux.map((fn: (data: DataProps) => void) => fn(data)),
  };
};

const NextRoute: RouteRulesType = {
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
    nextPath: (data: DataProps) => getNextPasscodeLoginRoute(data.store),
    updateRedux: [
      (data: DataProps) => () => updateStoreAfterPasscodeLoginRoute(data.store),
    ],
  },
  "/generateseedphrase": {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [
      (data: DataProps) => () =>
        updateStoreAfterGenerateSeedPhraseRoute(data.state),
    ],
  },
};

const getNextOnboardingRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

  let path;
  if (!store.stateCache.authentication.passcodeIsSet) {
    path = RoutePaths.SET_PASSCODE_ROUTE;
  } else if (store.stateCache.authentication.passcodeIsSet && seedPhraseIsSet) {
    path = RoutePaths.DIDS_ROUTE;
  } else {
    path = RoutePaths.GENERATE_SEED_PHRASE_ROUTE;
  }

  return { canNavigate: true, pathname: path };
};

const getNextSetPasscodeRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

  const nextPath: string = seedPhraseIsSet
    ? RoutePaths.DIDS_ROUTE
    : RoutePaths.GENERATE_SEED_PHRASE_ROUTE;
  return { canNavigate: true, pathname: nextPath };
};

const updateStoreAfterSetPasscodeRoute = (store: RootState) => {
  return setAuthentication({
    ...store.stateCache.authentication,
    loggedIn: true,
    time: Date.now(),
    passcodeIsSet: true,
  });
};

const getNextPasscodeLoginRoute = (store: RootState) => {
  const routesIncludeOnboarding = store.stateCache.routes.some(
    (route) => route.path === RoutePaths.ONBOARDING_ROUTE
  );
  const nextPath: string = routesIncludeOnboarding
    ? RoutePaths.GENERATE_SEED_PHRASE_ROUTE
    : store.stateCache.routes.length && store.stateCache.routes[0].path?.length
    ? store.stateCache.routes[0].path
    : RoutePaths.ONBOARDING_ROUTE;

  return { canNavigate: true, pathname: nextPath };
};

const updateStoreAfterPasscodeLoginRoute = (store: RootState) => {
  return setAuthentication({
    ...store.stateCache.authentication,
    loggedIn: true,
    time: Date.now(),
  });
};

const getNextGenerateSeedPhraseRoute = () => {
  return { canNavigate: true, pathname: RoutePaths.VERIFY_SEED_PHRASE_ROUTE };
};

const updateStoreAfterGenerateSeedPhraseRoute = (
  state: PageState | undefined
) => {
  if (state) return setSeedPhraseCache(state.seedPhrase);
};

export {
  getNextRoute,
  NextRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextPasscodeLoginRoute,
  updateStoreAfterPasscodeLoginRoute,
  getNextGenerateSeedPhraseRoute,
  updateStoreAfterGenerateSeedPhraseRoute,
};
