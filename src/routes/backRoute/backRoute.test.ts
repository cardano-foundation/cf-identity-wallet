import { RootState } from "../../store";
describe("NextRules", () => {
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
});

describe("getNextRoute", () => {
  let storeMock: RootState;
  const state = {};
  const payload = {};
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
});
