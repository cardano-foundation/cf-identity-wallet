import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { ROUTES } from "../index";
import { RootState } from "../../store";
import { setAuthentication } from "../../store/reducers/stateCache";
import { setSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import {PageState, PayloadProps, RouteRulesType} from "./nextRoute.types";


const getNextRoute = (
  currentPath: string,
  store: RootState,
  state?: PageState,
  payload?: PayloadProps
): {
  nextPath: { pathname: string; canNavigate: boolean };
  updateRedux?: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const [nextPath, ...updateRedux] = NextRoute[currentPath];

  return {
    nextPath: nextPath(store, state, payload),
    updateRedux: updateRedux
      ? updateRedux.map(
        (
          fn:
              | ((
                  store: RootState,
                  state: PageState | undefined,
                  payload: PayloadProps | undefined
                ) => void)
              | undefined
        ) => fn && fn(store, state, payload)
      )
      : [],
  };
};

const NextRoute: RouteRulesType = {
  "/onboarding": [(store: RootState) => getNextOnboardingRoute(store)],
  "/setpasscode": [
    (store: RootState) => getNextSetPasscodeRoute(store),
    (store: RootState) => () => updateStoreAfterSetPasscodeRoute(store),
  ],
  "/passcodelogin": [
    (store: RootState) => getNextPasscodeLoginRoute(store),
    (store: RootState) => () => updateStoreAfterPasscodeLoginRoute(store),
  ],
  "/generateseedphrase": [
    () => getNextGenerateSeedPhraseRoute(),
    (store: RootState, state: PageState) => () =>
      updateStoreAfterGenerateSeedPhraseRoute(store, state),
  ],
};

const getNextOnboardingRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

  let path;
  if (!store.stateCache.authentication.passcodeIsSet) {
    path = ROUTES.SET_PASSCODE_ROUTE;
  } else if (store.stateCache.authentication.passcodeIsSet && seedPhraseIsSet) {
    path = ROUTES.DIDS_ROUTE;
  } else {
    path = ROUTES.GENERATE_SEED_PHRASE_ROUTE;
  }

  return { canNavigate: true, pathname: path };
};

const getNextSetPasscodeRoute = (store: RootState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;

  const nextPath: string = seedPhraseIsSet
    ? ROUTES.DIDS_ROUTE
    : ROUTES.GENERATE_SEED_PHRASE_ROUTE;
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
    (route) => route.path === ROUTES.ONBOARDING_ROUTE
  );
  const nextPath: string = routesIncludeOnboarding
    ? ROUTES.GENERATE_SEED_PHRASE_ROUTE
    : store.stateCache.routes.length && store.stateCache.routes[0].path?.length
      ? store.stateCache.routes[0].path
      : ROUTES.ONBOARDING_ROUTE;

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
  return { canNavigate: true, pathname: ROUTES.VERIFY_SEED_PHRASE_ROUTE };
};

const updateStoreAfterGenerateSeedPhraseRoute = (
  store: RootState,
  state: PageState
) => {
  return setSeedPhraseCache(state.seedPhrase);
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
