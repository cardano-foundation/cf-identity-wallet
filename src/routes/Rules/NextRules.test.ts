import {
  getNextGenerateSeedPhraseRoute,
  getNextOnboardingRoute,
  getNextPasscodeLoginRoute,
  getNextSetPasscodeRoute,
  NextRules,
  getNextRoute,
  updateStoreAfterGenerateSeedPhraseRoute,
  updateStoreAfterPasscodeLoginRoute,
  updateStoreAfterSetPasscodeRoute,
} from "./NextRules";
import { RootState } from "../../store";
import { ROUTES } from "../index";
import { setAuthentication } from "../../store/reducers/StateCache";
import { setSeedPhraseCache } from "../../store/reducers/SeedPhraseCache";

describe("NextRules", () => {
  let localStorageMock: any;
  let storeMock: RootState;

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
      canNavigate: true,
      pathname: ROUTES.GENERATE_SEED_PHRASE_ROUTE,
    });
  });

  test("should return correct route for /onboarding when passcodeIsSet is false and seedPhrase is set", () => {
    localStorageMock.getItem = jest.fn().mockReturnValue("someSeedPhrase");

    const result = getNextOnboardingRoute(storeMock);

    expect(result).toEqual({
      canNavigate: true,
      pathname: ROUTES.SET_PASSCODE_ROUTE,
    });
  });

  test("should return correct route for /setpasscode when seedPhrase is not set", () => {
    localStorageMock.getItem = jest.fn().mockReturnValue("someSeedPhrase");

    const result = getNextSetPasscodeRoute(storeMock);

    expect(result).toEqual({
      canNavigate: true,
      pathname: ROUTES.GENERATE_SEED_PHRASE_ROUTE,
    });
  });

  test("should update store correctly after /setpasscode route", () => {
    const expectedAuthentication = {
      ...storeMock.stateCache.authentication,
      loggedIn: true,
      time: expect.any(Number),
      passcodeIsSet: true,
    };

    const result = updateStoreAfterSetPasscodeRoute(storeMock);

    expect(result).toEqual(setAuthentication(expectedAuthentication));
  });

  test("should return correct route for /passcodelogin when the current routes path has value", () => {
    storeMock.stateCache.routes = [{ path: "/somePath" }];

    const result = getNextPasscodeLoginRoute(storeMock);

    expect(result).toEqual({
      canNavigate: true,
      pathname: "/somePath",
    });
  });

  test("should return correct route for /passcodelogin when the current routes path is empty", () => {
    storeMock.stateCache.routes = [{ path: "" }];
    const result = getNextPasscodeLoginRoute(storeMock);

    expect(result).toEqual({
      canNavigate: true,
      pathname: ROUTES.ONBOARDING_ROUTE,
    });
  });

  test("should update store correctly after /passcodelogin route", () => {
    const expectedAuthentication = {
      ...storeMock.stateCache.authentication,
      loggedIn: true,
      time: expect.any(Number),
    };

    const result = updateStoreAfterPasscodeLoginRoute(storeMock);

    expect(result).toEqual(setAuthentication(expectedAuthentication));
  });

  test("should return correct route for /generateseedphrase", () => {
    const result = getNextGenerateSeedPhraseRoute();

    expect(result).toEqual({
      canNavigate: true,
      pathname: ROUTES.VERIFY_SEED_PHRASE_ROUTE,
    });
  });

  test("should update store correctly after /generateseedphrase route", () => {
    const expectedSeedPhrase = "yourSeedPhrase";
    const state = {
      seedPhrase: expectedSeedPhrase,
    };
    const expectedAction = setSeedPhraseCache(expectedSeedPhrase);

    const result = updateStoreAfterGenerateSeedPhraseRoute(storeMock, state);

    expect(result).toEqual(expectedAction);
  });
});

describe("getNextPath", () => {
  let storeMock: RootState;
  let stateMock: any;
  let payloadMock: any;

  beforeEach(() => {
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

  test("should return the correct nextPath and updateRedux functions", () => {
    // Define la ruta actual y las funciones nextPath y updateRedux correspondientes
    const currentPath = "/onboarding";
    const nextPathFunc = jest.fn();
    const updateReduxFunc = jest.fn();
    NextRules[currentPath] = [nextPathFunc, updateReduxFunc];

    const result = getNextRoute(currentPath, storeMock, stateMock, payloadMock);

    expect(result).toEqual({
      nextPath: nextPathFunc(storeMock, stateMock, payloadMock),
      updateRedux: updateReduxFunc(storeMock, stateMock),
    });
    expect(nextPathFunc).toHaveBeenCalledWith(
      storeMock,
      stateMock,
      payloadMock
    );
    expect(updateReduxFunc).toHaveBeenCalledWith(storeMock, stateMock);
  });
});
