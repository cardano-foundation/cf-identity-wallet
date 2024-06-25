import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  removeCurrentRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { clearSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import { DataProps, PayloadProps } from "../nextRoute/nextRoute.types";
import { RoutePath, TabsRoutePath } from "../paths";
import { KeyStoreKeys, SecureStorage } from "../../core/storage";

const clearStorageAfterBack = (nextPath: string, data: DataProps) => {
  const authState = {
    ...data.store.stateCache.authentication,
  };
  const onboardingFlow = [
    {
      path: RoutePath.SSI_AGENT,
      clearFn: () => {
        SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN);
        authState.seedPhraseIsSet = false;
      },
    },
    {
      path: RoutePath.GENERATE_SEED_PHRASE,
      clearFn: () => {
        SecureStorage.delete(KeyStoreKeys.APP_OP_PASSWORD);
        SecureStorage.delete(KeyStoreKeys.APP_PASSWORD_SKIPPED);
        authState.passwordIsSet = false;
        authState.passwordIsSkipped = false;
      },
    },
    {
      path: RoutePath.CREATE_PASSWORD,
      clearFn: () => {
        SecureStorage.delete(KeyStoreKeys.APP_PASSCODE);
        authState.passcodeIsSet = false;
      },
    },
    {
      path: RoutePath.SET_PASSCODE,
    },
    {
      path: RoutePath.ONBOARDING,
    },
  ];

  for (const item of onboardingFlow) {
    if (nextPath === item.path) {
      break;
    }

    item.clearFn?.();
  }

  return () =>
    setAuthentication({
      ...authState,
    });
};

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  backPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { updateRedux } = backRoute[currentPath];
  const backPathUrl = backPath(data);
  const clearReduxState = clearStorageAfterBack(backPathUrl.pathname, data);

  return {
    backPath: backPathUrl,
    updateRedux: [...updateRedux, clearReduxState],
  };
};

const updateStoreSetCurrentRoute = (data: DataProps) => {
  const prevPath = calcPreviousRoute(data.store.stateCache.routes);

  let path;
  if (prevPath) {
    path = prevPath.path;
  } else {
    path = RoutePath.ONBOARDING;
  }

  return setCurrentRoute({ path });
};
const getPreviousRoute = (data: DataProps): { pathname: string } => {
  const routes = data.store.stateCache.routes;

  const prevPath = calcPreviousRoute(routes);

  let path;

  if (routes.length === 0) {
    path = RoutePath.ROOT;
  } else if (prevPath) {
    path = prevPath.path;
  } else {
    path = RoutePath.ONBOARDING;
  }

  if (path === RoutePath.VERIFY_SEED_PHRASE) {
    path = RoutePath.GENERATE_SEED_PHRASE;
  }

  return { pathname: path };
};

const calcPreviousRoute = (
  routes: { path: string; payload?: PayloadProps }[]
) => {
  if (!routes || routes.length < 2) return undefined;
  return routes[1];
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
  [RoutePath.SSI_AGENT]: {
    updateRedux: [removeCurrentRoute],
  },
  [RoutePath.SET_PASSCODE]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.CREATE_PASSWORD]: {
    updateRedux: [removeCurrentRoute],
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
  updateStoreSetCurrentRoute,
  backPath,
};
