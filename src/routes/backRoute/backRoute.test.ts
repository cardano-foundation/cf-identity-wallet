import { RootState } from "../../store";
import { DataProps } from "../nextRoute/nextRoute.types";
import {calcPreviousRoute, getBackRoute, getPreviousRoute} from "./backRoute";
import { RoutePath } from "../index";

jest.mock("../../store/reducers/stateCache", () => ({
  removeCurrentRoute: jest.fn(),
  setCurrentRoute: jest.fn(),
}));

jest.mock("../../store/reducers/seedPhraseCache", () => ({
  clearSeedPhraseCache: jest.fn(),
}));

describe("getBackRoute", () => {
  let storeMock: RootState;
  beforeEach(() => {
    storeMock = {
      seedPhraseCache: {
        seedPhrase: "",
      },
      stateCache: {
        routes: [{ path: "/route1" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          loggedIn: false,
          time: 0,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return the correct 'backPath' and 'updateRedux' when currentPath is '/'", () => {
    const currentPath = "/";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toEqual([]);
  });

  test("should return the correct back path when currentPath is /generateseedphrase", () => {
    const currentPath = "/generateseedphrase";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2)
  });

  test("should return the correct back path when currentPath is /verifyseedphrase", () => {
    const currentPath = "/verifyseedphrase";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(3)
  });

  test("should return the correct back path when currentPath is /setpasscode", () => {
    const currentPath = "/setpasscode";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2)
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
    const routes = [
      { path: RoutePath.PASSCODE_LOGIN, payload: {} }
    ];

    const result = calcPreviousRoute(routes);

    expect(result).toBeUndefined();
  });
});

describe("getPreviousRoute", () => {
  let storeMock: RootState;
  beforeEach(() => {
    storeMock = {
      seedPhraseCache: {
        seedPhrase: "",
      },
      stateCache: {
        routes: [{ path: "/route1" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          loggedIn: false,
          time: 0,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  test("should return the correct previous route pathname", () => {
    const data: DataProps = {
      store: storeMock,
    };

    const result = getPreviousRoute(data);

    expect(result).toEqual({ pathname: "/route2" });
  });

  test("should return the ROOT path if no previous route exists", () => {
    const data: DataProps = {
      store: storeMock,
    };

    data.store.stateCache.routes = [];

    const result = getPreviousRoute(data);

    expect(result).toEqual({ pathname: "/" });
  });
});

