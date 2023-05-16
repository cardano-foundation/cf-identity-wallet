import { RootState } from "../../store";
import { DataProps } from "../nextRoute/nextRoute.types";
import { calcPreviousRoute, getBackRoute } from "./backRoute";
import {
  removeCurrentRoute,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { clearSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
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

  test("should return the correct 'backPath' and 'updateRedux' when currentPath is '/generateseedphrase'", () => {
    const currentPath = "/generateseedphrase";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2);
    expect(result.updateRedux[0]).toBeInstanceOf(Function);
    expect(result.updateRedux[1]).toBeInstanceOf(Function);

    // Comprobar que se llamó a las funciones de Redux esperadas
    result.updateRedux[0]();
    expect(removeCurrentRoute).toHaveBeenCalled();

    result.updateRedux[1]();
    expect(setCurrentRoute).toHaveBeenCalledWith({ path: "/route2" });
  });

  test("should return the correct 'backPath' and 'updateRedux' when currentPath is '/verifyseedphrase'", () => {
    const currentPath = "/verifyseedphrase";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(3);
    expect(result.updateRedux[0]).toBeInstanceOf(Function);
    expect(result.updateRedux[1]).toBeInstanceOf(Function);
    expect(result.updateRedux[2]).toBeInstanceOf(Function);

    result.updateRedux[0]();
    expect(removeCurrentRoute).toHaveBeenCalled();

    result.updateRedux[1]();
    expect(setCurrentRoute).toHaveBeenCalledWith({ path: "/route2" });

    result.updateRedux[2]();
    expect(clearSeedPhraseCache).toHaveBeenCalled();
  });

  test("should return the correct 'backPath' and 'updateRedux' when currentPath is '/setpasscode'", () => {
    const currentPath = "/setpasscode";
    const data: DataProps = {
      store: storeMock,
    };

    const result = getBackRoute(currentPath, data);

    expect(result.backPath).toEqual({ pathname: "/route2" });
    expect(result.updateRedux).toHaveLength(2);
    expect(result.updateRedux[0]).toBeInstanceOf(Function);
    expect(result.updateRedux[1]).toBeInstanceOf(Function);

    // Comprobar que se llamó a las funciones de Redux esperadas
    result.updateRedux[0]();
    expect(removeCurrentRoute).toHaveBeenCalled();

    result.updateRedux[1]();
    expect(setCurrentRoute).toHaveBeenCalledWith({ path: "/route2" });
  });
});

describe("calcPreviousRoute", () => {
  test("should return the correct previous route", () => {
    const routes = [
      { path: "/route1" },
      { path: "/route2" },
      { path: "/route3" },
    ];

    const result = calcPreviousRoute(routes);

    expect(result).toEqual({ path: "/route2" });
  });

  test("should return undefined if no previous route found", () => {
    const result = calcPreviousRoute([]);

    expect(result).toBeUndefined();
  });

  test("should ignore 'PASSCODE_LOGIN' routes", () => {
    const routes = [
      { path: "/route1" },
      { path: RoutePath.PASSCODE_LOGIN },
      { path: "/route2" },
      { path: "/route3" },
      { path: "/route4" },
    ];

    const result = calcPreviousRoute(routes);

    expect(result).toEqual({ path: "/route2" });
  });
});
