import { createMemoryHistory } from "history";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Route, Router } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { VerifyPasscode } from "./VerifyPasscode";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SecureStorage } from "../../../core/storage";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { RoutePath } from "../../../routes";

interface StoreMocked {
  stateCache: {
    routes: TabsRoutePath[];
    authentication: {
      loggedIn: boolean;
      time: number;
      passcodeIsSet: boolean;
      seedPhraseIsSet?: boolean;
    };
    currentRoute: string;
  };
  cryptoAccountsCache: {
    cryptoAccounts: never[];
  };
}

const mockStore = configureStore();
const dispatchMock = jest.fn();
const history = createMemoryHistory();
const storeMocked = (initialState: StoreMocked) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

describe("Verify Passcode modal", () => {
  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.CRYPTO],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
      currentRoute: TabsRoutePath.CRYPTO,
    },
    cryptoAccountsCache: {
      cryptoAccounts: [],
    },
  };

  test.skip("It loads the modal", async () => {
    const mockSetIsOpen = jest.fn();
    const storedPass = "storedPass";
    const secureStorageGetMock = jest
      .spyOn(SecureStorage, "get")
      .mockResolvedValue(storedPass);
    const { queryByText, getByText, getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <VerifyPasscode
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          onVerify={() => {
            /**/
          }}
        />
      </Provider>
    );

    expect(getByTestId("verify-passcode")).toBeInTheDocument();
    waitForIonicReact();
    expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
  });
});
