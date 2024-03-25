/* eslint-disable @typescript-eslint/no-unused-vars */
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredDidFix } from "../../__fixtures__/filteredIdentifierFix";
import { SetUserName } from "./SetUserName";
import { ToastMsgType } from "../../globals/types";
import { setToastMsg } from "../../../store/reducers/stateCache";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

describe("CreateIdentifier modal", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: ["/"],
      authentication: {
        loggedIn: true,
        userName: "",
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    connectionsCache: {
      connections: connectionsFix,
    },
    identifiersCache: {
      identifiers: filteredDidFix,
      favourites: [],
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It renders modal successfully", async () => {
    const showSetUserName = true;
    const setShowSetUserName = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={showSetUserName}
          setIsOpen={setShowSetUserName}
        />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.setusername.title)).toBeVisible();
  });

  test.skip("It sets username successfully", async () => {
    const showSetUserName = true;
    const setShowSetUserName = jest.fn();
    const dispatch = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={showSetUserName}
          setIsOpen={setShowSetUserName}
        />
      </Provider>
    );
    const userNameInput = getByTestId("set-user-name-input");
    fireEvent.change(userNameInput, { target: { value: "Test" } });
    fireEvent.click(getByTestId("primary-button-set-user-name"));
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS)
    );
  });
});
