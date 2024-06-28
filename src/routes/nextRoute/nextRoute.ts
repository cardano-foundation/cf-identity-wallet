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
  const authentication = store.stateCache.authentication;

  let path;
  if (
    authentication.passcodeIsSet &&
    authentication.seedPhraseIsSet &&
    authentication.ssiAgentIsSet
  ) {
    path = RoutePath.TABS_MENU;
  } else {
    path = RoutePath.ONBOARDING;
  }

  return { pathname: path };
};

const getNextOnboardingRoute = (data: DataProps) => {
  let path = RoutePath.SET_PASSCODE;

  if (data.store.stateCache.authentication.passcodeIsSet) {
    path = RoutePath.CREATE_PASSWORD;
  }

  if (data.store.stateCache.authentication.passwordIsSet) {
    path = RoutePath.GENERATE_SEED_PHRASE;
  }

  if (data.store.stateCache.authentication.seedPhraseIsSet) {
    path = RoutePath.SSI_AGENT;
  }

  if (data.store.stateCache.authentication.ssiAgentIsSet) {
    path = RoutePath.TABS_MENU;
  }

  return { pathname: path };
};

const getNextConnectionDetailsRoute = () => {
  const path = TabsRoutePath.CREDENTIALS;
  return { pathname: path };
};

const getNextCredentialsRoute = () => {
  const path = RoutePath.CONNECTION_DETAILS;
  return { pathname: path };
};

const getNextCredentialDetailsRoute = () => {
  // @TODO - foconnor: if we close an archived credential, it should return to the archived view.
  const path = TabsRoutePath.CREDENTIALS;
  return { pathname: path };
};

const getNextNotificationsRoute = () => {
  const path = RoutePath.NOTIFICATION_DETAILS;
  return { pathname: path };
};

const getNextNotificationDetailsRoute = () => {
  const path = TabsRoutePath.NOTIFICATIONS;
  return { pathname: path };
};

const getNextSetPasscodeRoute = (store: StoreState) => {
  const seedPhraseIsSet = !!store.seedPhraseCache?.seedPhrase;
  const ssiAgentIsSet = store.stateCache.authentication.ssiAgentIsSet;

  let nextPath = RoutePath.CREATE_PASSWORD;

  if (seedPhraseIsSet) {
    nextPath = RoutePath.SSI_AGENT;
  }

  if (ssiAgentIsSet) {
    nextPath = RoutePath.TABS_MENU;
  }

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

const updateStoreAfterSetupSSI = (data: DataProps) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    ssiAgentIsSet: true,
  });
};

const getNextGenerateSeedPhraseRoute = () => {
  return { pathname: RoutePath.VERIFY_SEED_PHRASE };
};

const getNextVerifySeedPhraseRoute = () => {
  const nextPath = RoutePath.SSI_AGENT;
  return { pathname: nextPath };
};

const getNextCreateSSIAgentRoute = () => {
  const nextPath = RoutePath.TABS_MENU;
  return { pathname: nextPath };
};

const updateStoreSetSeedPhrase = (data: DataProps) => {
  return setSeedPhraseCache({
    seedPhrase: data.state?.seedPhrase,
    bran: data.state?.bran,
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
    path = TabsRoutePath.CREDENTIALS;
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
  [RoutePath.SSI_AGENT]: {
    nextPath: () => getNextCreateSSIAgentRoute(),
    updateRedux: [updateStoreAfterSetupSSI],
  },
  [RoutePath.CREATE_PASSWORD]: {
    nextPath: () => getNextCreatePasswordRoute(),
    updateRedux: [updateStoreAfterCreatePassword],
  },
  [RoutePath.CONNECTION_DETAILS]: {
    nextPath: () => getNextConnectionDetailsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.CREDENTIALS]: {
    nextPath: () => getNextCredentialsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.CREDENTIAL_DETAILS]: {
    nextPath: () => getNextCredentialDetailsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.NOTIFICATIONS]: {
    nextPath: () => getNextNotificationsRoute(),
    updateRedux: [],
  },
  [RoutePath.NOTIFICATION_DETAILS]: {
    nextPath: () => getNextNotificationDetailsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.SCAN]: {
    nextPath: (data: DataProps) => getNextScanRoute(data),
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
  getNextCreateSSIAgentRoute,
};
