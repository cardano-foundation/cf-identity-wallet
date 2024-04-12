import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  login,
  removeCurrentRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { clearSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import { DataProps, PayloadProps } from "../nextRoute/nextRoute.types";
import { RoutePath, TabsRoutePath } from "../paths";
import { getNextOnboardingRoute } from "../nextRoute";

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  backPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { backPath, updateRedux } = backRoute[currentPath];

  return {
    backPath: backPath ? backPath(data) : getBackPath(data),
    updateRedux,
  };
};

const updateStoreSetCurrentRoute = (data: DataProps) => {
  const prevPath = calcPreviousRoute(data.store.stateCache.routes);

  let path;
  if (prevPath) {
    path = prevPath.path;
  } else {
    path = data.store.stateCache.routes[0].path;
  }

  return setCurrentRoute({ path });
};
const getPreviousRoute = (data: DataProps): { pathname: string } => {
  const routes = data.store.stateCache.routes;

  const prevPath = calcPreviousRoute(routes);
  let path;

  if (routes.length === 0) {
    path = RoutePath.ROOT;
  } else if (
    routes.length === 2 &&
    routes[0].path === RoutePath.SET_PASSCODE &&
    routes[1].path === RoutePath.PASSCODE_LOGIN
  ) {
    path = RoutePath.PASSCODE_LOGIN;
  } else if (prevPath) {
    path = prevPath.path;
  } else {
    path = routes[0].path;
  }

  return { pathname: path };
};
const getPasscodeLoginBackRoute = (data: DataProps) => {
  let prevRoute = getPreviousRoute(data);

  if (prevRoute.pathname === RoutePath.ROOT) {
    if (!data.store.stateCache.authentication.seedPhraseIsSet) {
      prevRoute = { pathname: RoutePath.ONBOARDING };
    }
  }

  return prevRoute;
};
const updateStoreAfterPasscodeLoginRoute = (data: DataProps) => {
  return login();
};

const calcPreviousRoute = (
  routes: { path: string; payload?: PayloadProps }[]
) => {
  return routes
    .slice(1)
    .find((element) => element.path !== RoutePath.PASSCODE_LOGIN);
};

const getBackPath = (data: DataProps) => getPreviousRoute(data);

const backRoute: Record<string, any> = {
  [RoutePath.ROOT]: {
    updateRedux: [],
  },
  [RoutePath.ONBOARDING]: {
    updateRedux: [],
  },
  [RoutePath.GENERATE_SEED_PHRASE]: {
    updateRedux: [
      removeCurrentRoute,
      updateStoreSetCurrentRoute,
      clearSeedPhraseCache,
    ],
  },
  [RoutePath.VERIFY_SEED_PHRASE]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.SET_PASSCODE]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.PASSCODE_LOGIN]: {
    backPath: (data: DataProps) => getPasscodeLoginBackRoute(data),
    updateRedux: [removeCurrentRoute, updateStoreAfterPasscodeLoginRoute],
  },
  [RoutePath.CREATE_PASSWORD]: {
    updateRedux: [],
  },
  [RoutePath.CONNECTION_DETAILS]: {
    updateRedux: [removeCurrentRoute],
  },
  [TabsRoutePath.IDENTIFIER_DETAILS]: {
    updateRedux: [removeCurrentRoute],
  },
  [TabsRoutePath.CREDENTIAL_DETAILS]: {
    updateRedux: [removeCurrentRoute],
  },
};

export {
  getBackRoute,
  calcPreviousRoute,
  getPreviousRoute,
  updateStoreAfterPasscodeLoginRoute,
  updateStoreSetCurrentRoute,
  getBackPath,
};
