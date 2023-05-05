import { ROUTES } from "../index";
import { RootState } from "../../store";
import { setAuthentication } from "../../store/reducers/StateCache";
import Moment from "moment";

type RouteRulesType = Record<string, any>;
export const routeRules: RouteRulesType = {
  "/onboarding": [
    (store: RootState, state?: any, payload?: any) =>
      getNextOnboardingRoute(store, state, payload),
    (store: RootState) => () => {},
  ],
  "/setpasscode": [
    (store: RootState, state?: any, payload?: any) =>
      getNextSetPasscodeRoute(store, state, payload),
    (store: RootState) => () => updateStoreAfterSetPasscodeRoute(store),
  ],
};

const getNextOnboardingRoute = (store: RootState, state: any, payload: any) => {
  const seedPhraseIsSet: boolean = !!localStorage.getItem("seedPhrase");

  const nextPath: string = store.stateCache.authentication.passcodeIsSet && !seedPhraseIsSet
    ? ROUTES.GENERATE_SEED_PHRASE_ROUTE
    : ROUTES.SET_PASSCODE_ROUTE;
  return { canNavigate: true, pathname: nextPath };
};

const getNextSetPasscodeRoute = (
  store: RootState,
  state: any,
  payload: any
) => {
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
    passcodeIsSet: true
  });
};
