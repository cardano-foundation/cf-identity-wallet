import { ROUTES } from "../index";
import { RootState } from "../../store";

export const routeRules = {
  [ROUTES.ONBOARDING_ROUTE]: [
    (store: RootState) => getNextOnboardingRoute,
    (store: RootState, state: any, payload: any) => updateReduxAfterOnboarding,
  ],
  [ROUTES.SET_PASSCODE_ROUTE]: getNextDashboardRoute,
  [ROUTES.PASSCODE_LOGIN_ROUTE]: getNextLoginRoute,
  [ROUTES.GENERATE_SEED_PHRASE_ROUTE]: getNextProfileRoute,
};

const getNextOnboardingRoute = (
  store: RootState,
  state: RootState,
  payload: any
) => {
  const nextPath = store.stateCache.authentication.passcodeIsSet
    ? ROUTES.GENERATE_SEED_PHRASE_ROUTE
    : ROUTES.SET_PASSCODE_ROUTE;
  return { canNavigate: true, nextPath };
};
const updateReduxAfterOnboarding = (
  store: RootState,
  state: RootState,
  payload: any
) => {
  return null;
};
