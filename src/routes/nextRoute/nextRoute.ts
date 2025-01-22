import {
  clearSeedPhraseCache as reduxClearSeedPhrase,
  setSeedPhraseCache,
} from "../../store/reducers/seedPhraseCache";
import {
  setAuthentication,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { RoutePath, TabsRoutePath } from "../paths";
import { DataProps, NextRoute, PasswordState, RecoveryWalletProgressState, RouteState, SeedPhraseCacheState, StoreState, UpdateRedux } from "./nextRoute.types";

const clearSeedPhraseCache = () => reduxClearSeedPhrase();

const getNextRootRoute = (data: DataProps) => {
  const authentication = data.store.stateCache.authentication;

  let path = RoutePath.ONBOARDING;

  if (authentication.passcodeIsSet) {
    path = RoutePath.CREATE_PASSWORD;
  }

  if (authentication.passwordIsSet || authentication.passwordIsSkipped) {
    path = authentication.recoveryWalletProgress
      ? RoutePath.VERIFY_RECOVERY_SEED_PHRASE
      : RoutePath.GENERATE_SEED_PHRASE;
  }

  if (authentication.seedPhraseIsSet) {
    path = RoutePath.SSI_AGENT;
  }

  if (authentication.ssiAgentIsSet) {
    path = RoutePath.TABS_MENU;
  }

  return { pathname: path };
};

const getNextOnboardingRoute = (data: DataProps) => {
  const nextRoute = getNextRootRoute(data);

  if (nextRoute.pathname === RoutePath.ONBOARDING) {
    return {
      pathname: RoutePath.SET_PASSCODE,
    };
  }

  return nextRoute;
};

const getNextCredentialDetailsRoute = () => {
  const path = TabsRoutePath.CREDENTIALS;
  return { pathname: path };
};

const getNextNotificationsRoute = () => {
  const path = TabsRoutePath.NOTIFICATION_DETAILS;
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
    firstAppLaunch: false,
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
    recoveryWalletProgress: false,
    seedPhraseIsSet: true,
  });
};

const updateStoreRecoveryWallet = (data: DataProps<RecoveryWalletProgressState>) => {
  return setAuthentication({
    ...data.store.stateCache.authentication,
    recoveryWalletProgress: data.state?.recoveryWalletProgress,
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

const updateStoreSetSeedPhrase = (data: DataProps<SeedPhraseCacheState>) => {
  return setSeedPhraseCache({
    seedPhrase: data.state?.seedPhrase || "",
    bran: data.state?.bran || "",
  });
};
const updateStoreCurrentRoute = (data: DataProps<RouteState>) => {
  return setCurrentRoute({ path: data.state?.nextRoute || "" });
};

const getNextCreatePasswordRoute = (data: DataProps) => {
  if (data.store.stateCache.authentication.recoveryWalletProgress) {
    return { pathname: RoutePath.VERIFY_RECOVERY_SEED_PHRASE };
  }

  return { pathname: RoutePath.GENERATE_SEED_PHRASE };
};

const updateStoreAfterCreatePassword = (data: DataProps<PasswordState>) => {
  const skipped = data.state?.skipped;
  return setAuthentication({
    ...data.store.stateCache.authentication,
    passwordIsSet: !skipped,
    passwordIsSkipped: skipped,
  });
};

const getNextRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string };
  updateRedux: UpdateRedux[];
} => {
  const { nextPath, updateRedux } = nextRoute[currentPath];
  const updateReduxFn = [...updateRedux, updateStoreCurrentRoute];
  return {
    nextPath: nextPath(data),
    updateRedux: updateReduxFn as UpdateRedux[],
  };
};

const nextRoute: Record<string, NextRoute> = {
  [RoutePath.ROOT]: {
    nextPath: (data: DataProps) => getNextRootRoute(data),
    updateRedux: [],
  },
  [RoutePath.ONBOARDING]: {
    nextPath: (data: DataProps) => getNextOnboardingRoute(data),
    updateRedux: [updateStoreRecoveryWallet as UpdateRedux],
  },
  [RoutePath.SET_PASSCODE]: {
    nextPath: (data: DataProps) => getNextSetPasscodeRoute(data.store),
    updateRedux: [updateStoreAfterSetPasscodeRoute],
  },
  [RoutePath.GENERATE_SEED_PHRASE]: {
    nextPath: () => getNextGenerateSeedPhraseRoute(),
    updateRedux: [updateStoreSetSeedPhrase],
  },
  [RoutePath.VERIFY_SEED_PHRASE]: {
    nextPath: () => getNextVerifySeedPhraseRoute(),
    updateRedux: [updateStoreAfterVerifySeedPhraseRoute, clearSeedPhraseCache],
  },
  [RoutePath.VERIFY_RECOVERY_SEED_PHRASE]: {
    nextPath: () => getNextVerifySeedPhraseRoute(),
    updateRedux: [],
  },
  [RoutePath.SSI_AGENT]: {
    nextPath: () => getNextCreateSSIAgentRoute(),
    updateRedux: [updateStoreAfterSetupSSI],
  },
  [RoutePath.CREATE_PASSWORD]: {
    nextPath: (data: DataProps) => getNextCreatePasswordRoute(data),
    updateRedux: [updateStoreAfterCreatePassword as UpdateRedux],
  },
  [TabsRoutePath.CREDENTIAL_DETAILS]: {
    nextPath: () => getNextCredentialDetailsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.NOTIFICATIONS]: {
    nextPath: () => getNextNotificationsRoute(),
    updateRedux: [],
  },
  [TabsRoutePath.NOTIFICATION_DETAILS]: {
    nextPath: () => getNextNotificationDetailsRoute(),
    updateRedux: [],
  },
};

export {
  getNextCreatePasswordRoute, getNextCreateSSIAgentRoute, getNextGenerateSeedPhraseRoute, getNextOnboardingRoute, getNextRootRoute,
  getNextRoute, getNextSetPasscodeRoute, getNextVerifySeedPhraseRoute, updateStoreAfterCreatePassword, updateStoreAfterSetPasscodeRoute, updateStoreAfterVerifySeedPhraseRoute, updateStoreCurrentRoute,
  updateStoreSetSeedPhrase
};

