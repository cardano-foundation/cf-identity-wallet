import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { ionFireEvent, waitForIonicReact } from "@ionic/react-test-utils";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { CredentialOptions } from "./CredentialOptions";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

const dispatchMock = jest.fn();

describe("Identifier Options modal", () => {
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("should display the modal", async () => {
    const setCredOptionsIsOpen = jest.fn();
    const optionDeleteMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <CredentialOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setCredOptionsIsOpen}
          cardData={credsFixAcdc[0]}
          credsOptionAction={optionDeleteMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    // expect(getByTestId("creds-options-modal")).toBeVisible();
    expect(getByTestId("creds-options-view-button")).toBeVisible();
    expect(getByTestId("creds-options-archive-button")).toBeVisible();
  });

  test("Click on archived option", async () => {
    const setCredOptionsIsOpen = jest.fn();
    const optionArchivedMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <CredentialOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setCredOptionsIsOpen}
          cardData={credsFixAcdc[0]}
          credsOptionAction={optionArchivedMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByTestId("creds-options-archive-button")).toBeVisible();

    act(() => {
      ionFireEvent.click(getByTestId("creds-options-archive-button"));
    });

    await waitFor(() => {
      expect(optionArchivedMock).toBeCalledTimes(1);
      expect(setCredOptionsIsOpen).toBeCalledTimes(1);
    });
  });

  test("Click on show JSON option", async () => {
    const setCredOptionsIsOpen = jest.fn();
    const optionArchivedMock = jest.fn();

    const { getByTestId, getByText } = render(
      <Provider store={mockedStore}>
        <CredentialOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setCredOptionsIsOpen}
          cardData={credsFixAcdc[0]}
          credsOptionAction={optionArchivedMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByTestId("creds-options-view-button")).toBeVisible();

    act(() => {
      ionFireEvent.click(getByTestId("creds-options-view-button"));
    });

    await waitFor(() => {
      expect(setCredOptionsIsOpen).toBeCalledTimes(1);
    });

    expect(
      getByText(EN_TRANSLATIONS.credentials.details.view.title)
    ).toBeVisible();
    expect(getByTestId("cred-content").innerHTML).toBe(
      JSON.stringify(credsFixAcdc[0], null, 2)
    );
    expect(getByTestId("cred-copy-json")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("cred-copy-json"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
      );
    });
  });
});
