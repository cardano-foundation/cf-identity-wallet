import Moment from "moment";
import { ROUTES } from "../index";
import { RootState } from "../../store";
import { setAuthentication } from "../../store/reducers/StateCache";
import { setSeedPhraseCache } from "../../store/reducers/SeedPhraseCache";

type RouteRulesType = Record<string, any>;
const NextRules: RouteRulesType = {
  "/onboarding": [
    (store: RootState) => getNextOnboardingRoute(store),
    () => () => {},
  ],
  "/setpasscode": [
    () => getNextSetPasscodeRoute(),
    (store: RootState) => () => updateStoreAfterSetPasscodeRoute(store),
  ],
  "/passcodelogin": [
    (store: RootState) => getNextPasscodeLoginRoute(store),
    (store: RootState) => () => updateStoreAfterPasscodeLoginRoute(store),
  ],
  "/generateseedphrase": [
    () => getNextGenerateSeedPhraseRoute(),
    (store: RootState, state: any) => () =>
      updateStoreAfterGenerateSeedPhraseRoute(store, state),
  ],
};

const getNextOnboardingRoute = (store: RootState) => {
  const seedPhraseIsSet: boolean = !!localStorage.getItem("seedPhrase");

  const nextPath: string =
    store.stateCache.authentication.passcodeIsSet && !seedPhraseIsSet
      ? ROUTES.GENERATE_SEED_PHRASE_ROUTE
      : ROUTES.SET_PASSCODE_ROUTE;
  return { canNavigate: true, pathname: nextPath };
};

const getNextSetPasscodeRoute = () => {
  const seedPhraseIsSet: boolean = !!localStorage.getItem("seedPhrase");

  const nextPath: string = seedPhraseIsSet
    ? ROUTES.DIDS_ROUTE
    : ROUTES.GENERATE_SEED_PHRASE_ROUTE;
  return { canNavigate: true, pathname: nextPath };
};

const updateStoreAfterSetPasscodeRoute = (store: RootState) => {
  return setAuthentication({
    ...store.stateCache.authentication,
    loggedIn: true,
    time: Moment().valueOf(),
    passcodeIsSet: true,
  });
};

const getNextPasscodeLoginRoute = (store: RootState) => {
  const nextPath: string = store.stateCache.currentRoute.path?.length
    ? store.stateCache.currentRoute.path
    : "/";
  return { canNavigate: true, pathname: nextPath };
};

const updateStoreAfterPasscodeLoginRoute = (store: RootState) => {
  return setAuthentication({
    ...store.stateCache.authentication,
    loggedIn: true,
    time: Moment().valueOf(),
  });
};

const getNextGenerateSeedPhraseRoute = () => {
  return { canNavigate: true, pathname: ROUTES.VERIFY_SEED_PHRASE_ROUTE };
};

const updateStoreAfterGenerateSeedPhraseRoute = (
  store: RootState,
  state: any
) => {
  return setSeedPhraseCache(state.seedPhrase);
};

export { NextRules };
