import {
  getNextGenerateSeedPhraseRoute,
  getNextOnboardingRoute,
  getNextSetPasscodeRoute,
  getNextRoute,
  updateStoreAfterSetPasscodeRoute,
  getNextVerifySeedPhraseRoute,
} from "./nextRoute";
import { RootState } from "../../store";
import { RoutePath } from "../index";
import { setAuthentication } from "../../store/reducers/stateCache";

describe("NextRoute", () => {
  let localStorageMock: any;
  let storeMock: RootState;
  const state = {};

  beforeEach(() => {
    localStorageMock = {};
    storeMock = {
      stateCache: {
        routes: [],
        authentication: {
          loggedIn: false,
          time: 0,
          passcodeIsSet: false,
        },
      },
      seedPhraseCache: {
        seedPhrase: "",
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return correct route for /onboarding when passcodeIsSet is true and seedPhrase is not set", () => {
    localStorageMock.getItem = jest.fn().mockReturnValue(null);
    storeMock.stateCache.authentication.passcodeIsSet = true;

    const result = getNextOnboardingRoute(storeMock);

    expect(result).toEqual({
      pathname: RoutePath.GENERATE_SEED_PHRASE,
    });
  });

  test("should return correct route for /onboarding when passcodeIsSet is false and seedPhrase is set", () => {
    localStorageMock.getItem = jest.fn().mockReturnValue("someSeedPhrase");

    const result = getNextOnboardingRoute(storeMock);

    expect(result).toEqual({
      pathname: RoutePath.SET_PASSCODE,
    });
  });

  test("should return correct route for /setpasscode when seedPhrase is not set", () => {
    localStorageMock.getItem = jest.fn().mockReturnValue("someSeedPhrase");

    const result = getNextSetPasscodeRoute(storeMock);

    expect(result).toEqual({
      pathname: RoutePath.GENERATE_SEED_PHRASE,
    });
  });

  test("should update store correctly after /setpasscode route", () => {
    const expectedAuthentication = {
      ...storeMock.stateCache.authentication,
      loggedIn: true,
      time: expect.any(Number),
      passcodeIsSet: true,
    };

    const result = updateStoreAfterSetPasscodeRoute({ store: storeMock });

    expect(result).toEqual(setAuthentication(expectedAuthentication));
  });

  test("should return correct route for /generateseedphrase", () => {
    const result = getNextGenerateSeedPhraseRoute();

    expect(result).toEqual({
      pathname: RoutePath.VERIFY_SEED_PHRASE,
    });
  });

  test("should return correct route for /verifyseedphrase", () => {
    const result = getNextVerifySeedPhraseRoute();

    expect(result).toEqual({
      pathname: RoutePath.TABS_MENU,
    });
  });
});

describe("getNextRoute", () => {
  const storeMock: RootState = {
    stateCache: {
      routes: [],
      authentication: {
        loggedIn: false,
        time: 0,
        passcodeIsSet: true,
      },
    },
    seedPhraseCache: {
      seedPhrase: "",
    },
  };
  const state = {};
  const payload = {};

  test("should return the correct Onboarding next route", () => {
    let result = getNextRoute(RoutePath.ONBOARDING, {
      store: storeMock,
      state,
      payload,
    });

    expect(result.nextPath).toEqual({
      pathname: RoutePath.GENERATE_SEED_PHRASE,
    });

    storeMock.stateCache.authentication.passcodeIsSet = false;

    result = getNextRoute(RoutePath.ONBOARDING, {
      store: storeMock,
      state,
      payload,
    });

    expect(result.nextPath).toEqual({ pathname: RoutePath.SET_PASSCODE });

    storeMock.stateCache.authentication.passcodeIsSet = true;
    storeMock.seedPhraseCache.seedPhrase = "example-seed-phrase";

    result = getNextRoute(RoutePath.ONBOARDING, {
      store: storeMock,
      state,
      payload,
    });

    expect(result.nextPath).toEqual({ pathname: RoutePath.TABS_MENU });
  });

  test("getNextSetPasscodeRoute should return the correct next path when seed phrase is set", () => {
    storeMock.seedPhraseCache = {
      seedPhrase: "example seed phrase",
    };

    const result = getNextSetPasscodeRoute(storeMock);
    expect(result).toEqual({
      pathname: RoutePath.TABS_MENU,
    });
  });

  test("getNextSetPasscodeRoute should return the correct next path when seed phrase is not set", () => {
    storeMock.seedPhraseCache.seedPhrase = "";

    const result = getNextSetPasscodeRoute(storeMock);
    expect(result).toEqual({
      pathname: RoutePath.GENERATE_SEED_PHRASE,
    });
  });
});
