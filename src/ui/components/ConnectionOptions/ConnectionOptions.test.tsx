import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { ConnectionOptions } from "./ConnectionOptions";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: never }) => children,
}));

const dispatchMock = jest.fn();

describe("Connection Options modal", () => {
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

  test("Connection options modal", async () => {
    const setCredOptionsIsOpen = jest.fn();
    const optionDeleteMock = jest.fn();
    const editNotesMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <ConnectionOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setCredOptionsIsOpen}
          handleDelete={optionDeleteMock}
          handleEdit={editNotesMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByTestId("connection-options-manage-button")).toBeVisible();
    expect(getByTestId("delete-button-connection-options")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("connection-options-manage-button"));
    });

    expect(editNotesMock).toBeCalledTimes(1);
    expect(setCredOptionsIsOpen).toBeCalledTimes(1);

    act(() => {
      fireEvent.click(getByTestId("delete-button-connection-options"));
    });

    expect(optionDeleteMock).toBeCalledTimes(1);
    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(OperationType.DELETE_CONNECTION)
    );
  });
});
