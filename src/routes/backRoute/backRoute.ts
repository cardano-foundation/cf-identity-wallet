import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  removeCurrentRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { clearSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import { DataProps, PayloadProps } from "../nextRoute/nextRoute.types";
import {RoutePath, TabsRoutePath} from "../paths";

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  backPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { updateRedux } = backRoute[currentPath];

  return {
    backPath: backPath(data),
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
const getPreviousRoute = (data: DataProps) => {
  const { routes } = data.store.stateCache;

  const prevPath = calcPreviousRoute(routes);
  let path;
  if (routes.length === 0) {
    path = RoutePath.ROOT;
  } else if (prevPath) {
    path = prevPath.path;
  } else {
    path = routes[0].path;
  }
  return { pathname: path };
};

const updateStoreAfterPasscodeLoginRoute = (data: DataProps) => {
  const seedPhraseISet = !!data.store.seedPhraseCache.seedPhrase160;

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

const calcPreviousRoute = (
  routes: { path: string; payload?: PayloadProps }[]
) => {
  return routes
    .slice(1)
    .find((element) => element.path !== RoutePath.PASSCODE_LOGIN);
};

const backPath = (data: DataProps) => getPreviousRoute(data);

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
    updateRedux: [updateStoreAfterPasscodeLoginRoute],
  },
  [TabsRoutePath.DID_DETAILS]: {
    updateRedux: [removeCurrentRoute],
  },
};

export {
  getBackRoute,
  calcPreviousRoute,
  getPreviousRoute,
  updateStoreAfterPasscodeLoginRoute,
  updateStoreSetCurrentRoute,
};
