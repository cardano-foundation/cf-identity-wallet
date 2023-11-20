import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  removeSetPasscodeRoute,
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import {
  clearSeedPhraseCache,
  setSeedPhraseCache,
} from "../../store/reducers/seedPhraseCache";
import { DataProps, StoreState } from "./nextRoute.types";
import { RoutePath, TabsRoutePath } from "../paths";
import { OperationType, ToastMsgType } from "../../ui/globals/types";

const getNextRootRoute = (store: StoreState) => {
  const isInitialized = store.stateCache.initialized;
  const authentication = store.stateCache.authentication;
  const routes = store.stateCache.routes;
  const initialRoute =
    routes.some((route) => route.path === "/") || routes.length === 0;

  let path;
  if (authentication.passcodeIsSet && !authentication.loggedIn) {
    path = RoutePath.PASSCODE_LOGIN;
  } else if (routes.length === 1 && !isInitialized) {
    path = RoutePath.ONBOARDING;
  } else if (authentication.passcodeIsSet && authentication.seedPhraseIsSet) {
    if (
      store.stateCache.currentOperation ===
      (OperationType.CREATE_SEED_PHRASE || OperationType.RESTORE_SEED_PHRASE)
    ) {
      path = RoutePath.CREATE_PASSWORD;
    } else {
      path = RoutePath.TABS_MENU;
    }
  } else {
    if (initialRoute) {
      path = RoutePath.ONBOARDING;
    } else {
      path = routes[0].path;
    }
  }

  return { pathname: path };
};

const getNextOnboardingRoute = (data: DataProps) => {
  if (!data.store.stateCache.authentication.passcodeIsSet) {
    return { pathname: RoutePath.SET_PASSCODE };
  }

  let path;
  const op = data?.state?.currentOperation;
  if (op === OperationType.CREATE_SEED_PHRASE) {
    path = `${RoutePath.GENERATE_SEED_PHRASE}${RoutePath.CREATE_NEW_SEED_PHRASE}`;
  } else if (op == OperationType.RESTORE_SEED_PHRASE) {
    path = `${RoutePath.GENERATE_SEED_PHRASE}${RoutePath.RESTORE_SEED_PHRASE}`;
  } else {
    path = RoutePath.GENERATE_SEED_PHRASE;
  }
  return { pathname: path };
};

const getNextConnectionDetailsRoute = () => {
  const path = TabsRoutePath.CREDS;
  return { pathname: path };
};

const getNextCreateCryptoAccountRoute = () => {
  const path = RoutePath.GENERATE_SEED_PHRASE;
  return { pathname: path };
};

const getNextCredentialsRoute = () => {
  const path = RoutePath.CONNECTION_DETAILS;
  return { pathname: path };
};

const getNextCredentialDetailsRoute = () => {
  const path = TabsRoutePath.CREDS;
  return { pathname: path };
};

const getNextSetPasscodeRoute = (store: StoreState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase160;

  const nextPath: string = seedPhraseIsSet
    ? RoutePath.TABS_MENU
    : RoutePath.GENERATE_SEED_PHRASE;

  return { pathname: nextPath };
};

const updateStoreAfterSetPasscodeRoute = (data: DataProps) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    loggedIn: true,
    time: Date.now(),
    passcodeIsSet: true,
  });
};
const updateStoreAfterVerifySeedPhraseRoute = (data: DataProps) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    seedPhraseIsSet: true,
  });
};

const getNextGenerateSeedPhraseRoute = () => {
  return { pathname: RoutePath.VERIFY_SEED_PHRASE };
};

const getNextVerifySeedPhraseRoute = (data: DataProps) => {
  const route = data?.state?.currentOperation;
  const nextPath: string =
    route === OperationType.CREATE_SEED_PHRASE
      ? RoutePath.CREATE_PASSWORD
      : TabsRoutePath.CRYPTO;

  return { pathname: nextPath };
};

const updateStoreSetSeedPhrase = (data: DataProps) => {
  return setSeedPhraseCache({
    seedPhrase160: data.state?.seedPhrase160,
    seedPhrase256: data.state?.seedPhrase256,
    selected: data.state?.selected,
  });
};
const updateStoreCurrentRoute = (data: DataProps) => {
  return setCurrentRoute({ path: data.state?.nextRoute });
};

const getNextCreatePasswordRoute = () => {
  return { pathname: RoutePath.TABS_MENU };
};
const updateStoreAfterCreatePassword = (data: DataProps) => {
  const skipped = data.state?.skipped;
  return setAuthentication({
    ...data.store.stateCache.authentication,
    passwordIsSet: !skipped,
    passwordIsSkipped: skipped,
  });
};

const getNextScanRoute = (data: DataProps) => {
  const currentToastMsg = data?.state?.toastMsg;
  let path;
  if (
    currentToastMsg === ToastMsgType.CONNECTION_REQUEST_PENDING ||
    currentToastMsg === ToastMsgType.CREDENTIAL_REQUEST_PENDING
  ) {
    path = TabsRoutePath.CREDS;
  }
  return { pathname: path };
};

const getNextRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string };
  updateRedux: ((
    data: DataProps
  ) => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { nextPath, updateRedux } = nextRoute[currentPath];
  updateRedux.push(updateStoreCurrentRoute);
  return {
    nextPath: nextPath(data),
    updateRedux,
  };
};

const nextRoute: Record<string, any> = {
  [RoutePath.ROOT]: {
    nextPath: (data: DataProps) => getNextRootRoute(data.store),
    updateRedux: [],
  },
  [RoutePath.ONBOARDING]: {
    nextPath: (data: DataProps) => getNextOnboardingRoute(data),
    updateRedux: [],
  },
  [RoutePath.SET_PASSCODE]: {
    nextPath: (data: DataProps) => getNextSetPasscodeRoute(data.store),
    updateRedux: [removeSetPasscodeRoute, updateStoreAfterSetPasscodeRoute],
  },
  [RoutePath.GENERATE_SEED_PHRASE]: {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [updateStoreSetSeedPhrase],
  },
  [RoutePath.VERIFY_SEED_PHRASE]: {
    nextPath: (data: DataProps) => getNextVerifySeedPhraseRoute(data),
    updateRedux: [updateStoreAfterVerifySeedPhraseRoute, clearSeedPhraseCache],
  },
  [RoutePath.CREATE_PASSWORD]: {
    nextPath: () => getNextCreatePasswordRoute(),
    updateRedux: [updateStoreAfterCreatePassword],
  },
  [RoutePath.CONNECTION_DETAILS]: {
    nextPath: () => getNextConnectionDetailsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.CRYPTO]: {
    nextPath: () => getNextCreateCryptoAccountRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.CREDS]: {
    nextPath: () => getNextCredentialsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.SCAN]: {
    nextPath: (data: DataProps) => getNextScanRoute(data),
    updateRedux: [],
  },
  [TabsRoutePath.CRED_DETAILS]: {
    nextPath: () => getNextCredentialDetailsRoute(),
    updateRedux: [],
  },
};

export {
  getNextRootRoute,
  getNextRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextGenerateSeedPhraseRoute,
  getNextVerifySeedPhraseRoute,
  updateStoreCurrentRoute,
  updateStoreSetSeedPhrase,
  updateStoreAfterVerifySeedPhraseRoute,
  getNextCreatePasswordRoute,
  updateStoreAfterCreatePassword,
};
