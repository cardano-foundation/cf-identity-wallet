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
import { ToastMsgType } from "../../ui/globals/types";

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
    path = RoutePath.TABS_MENU;
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
  let path;
  if (data.store.stateCache.authentication.passcodeIsSet) {
    path = data.store.stateCache.authentication.passwordIsSet
      ? RoutePath.GENERATE_SEED_PHRASE
      : RoutePath.CREATE_PASSWORD;
  } else {
    path = RoutePath.SET_PASSCODE;
  }

  return { pathname: path };
};

const getNextConnectionDetailsRoute = () => {
  const path = TabsRoutePath.CREDS;
  return { pathname: path };
};

const getNextCredentialsRoute = () => {
  const path = RoutePath.CONNECTION_DETAILS;
  return { pathname: path };
};

const getNextCredentialDetailsRoute = () => {
  // @TODO - foconnor: if we close an archived credential, it should return to the archived view.
  const path = TabsRoutePath.CREDS;
  return { pathname: path };
};

const getNextSetPasscodeRoute = (store: StoreState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase160;

  const nextPath: string = seedPhraseIsSet
    ? RoutePath.TABS_MENU
    : RoutePath.CREATE_PASSWORD;

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

const getNextVerifySeedPhraseRoute = () => {
  const nextPath = RoutePath.TABS_MENU;
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
  return { pathname: RoutePath.GENERATE_SEED_PHRASE };
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
    // @TODO - foconnor: We need to open the connection list if it is CONNECTION_REQUEST_PENDING.
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
    nextPath: () => getNextVerifySeedPhraseRoute(),
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
