/* eslint-disable @typescript-eslint/no-unused-vars */
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredKeriFix } from "../../__fixtures__/filteredIdentifierFix";
import { CustomToast } from "./CustomToast";
import { ToastMsgType } from "../../globals/types";

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
        userName: "Test",
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    connectionsCache: {
      connections: connectionsFix,
    },
    identifiersCache: {
      identifiers: filteredKeriFix,
      favourites: [],
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It renders generic message successfully", async () => {
    const toastMsg = ToastMsgType.COPIED_TO_CLIPBOARD;
    const showToast = true;
    const setShowToast = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CustomToast
          toastMsg={toastMsg}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </Provider>
    );
    expect(getByTestId("confirmation-toast")).toHaveAttribute(
      "message",
      EN_TRANSLATIONS.toast.copiedtoclipboard
    );
    expect(getByTestId("confirmation-toast")).toHaveAttribute(
      "color",
      "secondary"
    );
  });

  test("It renders message with user name successfully", async () => {
    const toastMsg = ToastMsgType.USERNAME_CREATION_SUCCESS;
    const showToast = true;
    const setShowToast = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CustomToast
          toastMsg={toastMsg}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </Provider>
    );
    expect(getByTestId("confirmation-toast")).toHaveAttribute(
      "message",
      "Welcome, Test!"
    );
  });

  test("It renders error message successfully", async () => {
    const toastMsg = ToastMsgType.USERNAME_CREATION_ERROR;
    const showToast = true;
    const setShowToast = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CustomToast
          toastMsg={toastMsg}
          showToast={showToast}
          setShowToast={setShowToast}
        />
      </Provider>
    );
    expect(getByTestId("confirmation-toast")).toHaveAttribute(
      "message",
      EN_TRANSLATIONS.toast.usernamecreationerror
    );
    expect(getByTestId("confirmation-toast")).toHaveAttribute(
      "color",
      "danger"
    );
  });
});
