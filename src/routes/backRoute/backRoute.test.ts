import { RootState } from "../../store";
import {
  calcPreviousRoute,
  getBackRoute,
  getPreviousRoute,
  updateStoreAfterPasscodeLoginRoute,
} from "./backRoute";
import { RoutePath } from "../index";
import { setAuthentication } from "../../store/reducers/stateCache";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../constants/appConstants";

jest.mock("../../store/reducers/stateCache", () => ({
  removeCurrentRoute: jest.fn(),
  setCurrentRoute: jest.fn(),
  setAuthentication: jest.fn(),
}));

jest.mock("../../store/reducers/seedPhraseCache", () => ({
  clearSeedPhraseCache: jest.fn(),
}));

describe("getBackRoute", () => {
  let storeMock: RootState;
  const state = {};
  beforeEach(() => {
    storeMock = {
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      stateCache: {
        routes: [{ path: "/route1" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          loggedIn: false,
          time: 0,
        },
        defaultCryptoAccount: "",
      },
      identitiesCache: { identities: [] },
      credsCache: { creds: [] },
      cryptoAccountsCache: {
        cryptoAccounts: [],
        defaultCryptoAccount: "",
        hideCryptoBalances: false,
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return the correct 'backPath' and 'updateRedux' when currentPath is '/'", () => {
    const currentPath = "/";

    const result = getBackRoute(currentPath);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toEqual([]);
  });

  test("should return the correct back path when currentPath is /generateseedphrase", () => {
    const currentPath = "/generateseedphrase";

    const result = getBackRoute(currentPath);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(3);
  });

  test("should return the correct back path when currentPath is /verifyseedphrase", () => {
    const currentPath = "/verifyseedphrase";

    const result = getBackRoute(currentPath);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2);
  });

  test("should return the correct back path when currentPath is /setpasscode", () => {
    const currentPath = "/setpasscode";

    const result = getBackRoute(currentPath);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2);
  });

  test("should update store correctly after /passcodelogin route", () => {
    storeMock = {
      stateCache: {
        routes: [],
        authentication: {
          loggedIn: false,
          time: 0,
          passcodeIsSet: true,
          seedPhraseIsSet: false,
          passwordIsSet: false,
        },
        defaultCryptoAccount: "",
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      identitiesCache: { identities: [] },
      credsCache: { creds: [] },
      cryptoAccountsCache: {
        cryptoAccounts: [],
        defaultCryptoAccount: "",
        hideCryptoBalances: false,
      },
    };
    const expectedAuthentication = {
      ...storeMock.stateCache.authentication,
      loggedIn: true,
      time: expect.any(Number),
    };
    const result = updateStoreAfterPasscodeLoginRoute({
      state,
    });

    expect(result).toEqual(setAuthentication(expectedAuthentication));
  });
});

describe("calcPreviousRoute", () => {
  test("should return the correct previous route", () => {
    const routes = [
      { path: "/", payload: {} },
      { path: "/generateseedphrase", payload: {} },
      { path: "/verifyseedphrase", payload: {} },
      { path: "/setpasscode", payload: {} },
    ];

    const result = calcPreviousRoute(routes);

    expect(result).toEqual({ path: "/generateseedphrase", payload: {} });
  });

  test("should return undefined if not available routes", () => {
    const routes = [{ path: RoutePath.PASSCODE_LOGIN, payload: {} }];

    const result = calcPreviousRoute(routes);

    expect(result).toBeUndefined();
  });
});

describe("getPreviousRoute", () => {
  let storeMock: RootState;
  beforeEach(() => {
    storeMock = {
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      stateCache: {
        routes: [{ path: "/route1" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          loggedIn: false,
          time: 0,
        },
        defaultCryptoAccount: "",
      },
      identitiesCache: { identities: [] },
      credsCache: { creds: [] },
      cryptoAccountsCache: {
        cryptoAccounts: [],
        defaultCryptoAccount: "",
        hideCryptoBalances: false,
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  test("should return the correct previous route pathname", () => {
    const result = getPreviousRoute();

    expect(result).toEqual({ pathname: "/route2" });
  });

  test("should return the ROOT path if no previous route exists", () => {
    const result = getPreviousRoute();

    expect(result).toEqual({ pathname: "/" });
  });
});
