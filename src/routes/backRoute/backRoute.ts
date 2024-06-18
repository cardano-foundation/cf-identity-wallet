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

const getDefaultPreviousPath = (path: string, data: DataProps) => {
  const isRecoveryMode =
    data.store.stateCache.authentication.recoveryWalletProgress;

  if (RoutePath.SSI_AGENT === path) {
    return isRecoveryMode
      ? RoutePath.VERIFY_RECOVERY_SEED_PHRASE
      : RoutePath.GENERATE_SEED_PHRASE;
  }

  if (RoutePath.VERIFY_SEED_PHRASE === path) {
    return RoutePath.GENERATE_SEED_PHRASE;
  }

  if (
    [
      RoutePath.VERIFY_RECOVERY_SEED_PHRASE,
      RoutePath.GENERATE_SEED_PHRASE,
    ].includes(path as RoutePath)
  ) {
    return RoutePath.CREATE_PASSWORD;
  }

  return RoutePath.ONBOARDING;
};

const clearSecureStore = (path: string) => {
  if (
    [
      RoutePath.VERIFY_RECOVERY_SEED_PHRASE,
      RoutePath.GENERATE_SEED_PHRASE,
    ].includes(path as RoutePath)
  ) {
    SecureStorage.delete(KeyStoreKeys.PASSWORD_SKIPPED);
    SecureStorage.delete(KeyStoreKeys.APP_OP_PASSWORD);
    return;
  }

  if (path === RoutePath.CREATE_PASSWORD) {
    SecureStorage.delete(KeyStoreKeys.RECOVERY_WALLET);
    return;
  }

  if (path === RoutePath.SSI_AGENT) {
    SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN);
    return;
  }
};

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  backPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { updateRedux } = backRoute[currentPath];
  clearSecureStore(currentPath);

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
    path = getDefaultPreviousPath(data.store.stateCache.routes[0].path, data);
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
    path = getDefaultPreviousPath(routes[0].path, data);
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

const clearPasswordState = (data: DataProps) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    passwordIsSkipped: false,
    passwordIsSet: false,
  });
};

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
      clearPasswordState,
    ],
  },
  [RoutePath.VERIFY_SEED_PHRASE]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.VERIFY_RECOVERY_SEED_PHRASE]: {
    updateRedux: [
      removeCurrentRoute,
      updateStoreSetCurrentRoute,
      clearPasswordState,
    ],
  },
  [RoutePath.SSI_AGENT]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.SET_PASSCODE]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  [RoutePath.CREATE_PASSWORD]: {
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
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
