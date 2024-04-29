import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { AnyAction, Store } from "@reduxjs/toolkit";
import configureStore from "redux-mock-store";
import { LockModal } from "./LockModal";
import { TabsRoutePath } from "../../../routes/paths";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { connectionsFix } from "../../__fixtures__/connectionsFix";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

const getInitialState = (loggedIn: boolean) => {
  return {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: loggedIn,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: true,
      },
    },
    seedPhraseCache: {
      seedPhrase160: "",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
    identifiersCache: {
      identifiers: filteredIdentifierFix,
      favourites: [],
    },
    connectionsCache: {
      connections: connectionsFix,
    },
  };
};

describe("Lock Modal", () => {
  test("Lock modal is rendered", async () => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    const store: Store<unknown, AnyAction> = {
      ...mockStore(getInitialState(true)),
      dispatch: dispatchMock,
    };
    const screen = render(
      <Provider store={store}>
        <LockModal />
      </Provider>
    );

    expect(screen.getByTestId("lock-modal-page")).toBeVisible();
  });
});
