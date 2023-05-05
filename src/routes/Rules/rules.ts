import { ROUTES } from "../index";
import { RootState } from "../../store";

type RouteRulesType = Record<string, any>;
export const routeRules:RouteRulesType = {
    "/onboarding": [
    (store: RootState, state: any, payload: any) => getNextOnboardingRoute(store, state, payload),
    (store: RootState) => () => {},
  ]
};

const getNextOnboardingRoute = (
  store: RootState,
  state: any,
  payload: any
) => {
  const nextPath:string = store.stateCache.authentication.passcodeIsSet
    ? ROUTES.GENERATE_SEED_PHRASE_ROUTE
    : ROUTES.SET_PASSCODE_ROUTE;
  return { canNavigate: true, pathname: nextPath };
};
