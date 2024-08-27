import { KeyboardResize } from "@capacitor/keyboard";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { EditIdentifier } from "./EditIdentifier";

const updateMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        updateIdentifier: () => updateMock(() => Promise.resolve(true)),
      },
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

const isNativeMock = jest.fn();
jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => isNativeMock(),
    },
  };
});

const addEventMock = jest.fn();
const removeAllListenerMock = jest.fn();
jest.mock("@capacitor/keyboard", () => {
  return {
    ...jest.requireActual("@capacitor/keyboard"),
    Keyboard: {
      addListener: (params: unknown) => addEventMock(params),
      removeAllListeners: () => removeAllListenerMock(),
    },
  };
});

describe("Edit identifier", () => {
  const dispatchMock = jest.fn();
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    isNativeMock.mockImplementation(() => false);
  });
  beforeAll(() => {
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
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Register keyboard event when render app", async () => {
    isNativeMock.mockImplementation(() => true);

    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { unmount } = render(
      <Provider store={mockedStore}>
        <EditIdentifier
          modalIsOpen={true}
          setModalIsOpen={setIdentifierOptionsIsOpen}
          setCardData={setCardData}
          cardData={identifierFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(addEventMock).toBeCalled();
    });

    unmount();

    await waitFor(() => {
      expect(removeAllListenerMock).toBeCalled();
    });
  });

  test("render", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <EditIdentifier
          modalIsOpen={true}
          setModalIsOpen={setIdentifierOptionsIsOpen}
          setCardData={setCardData}
          cardData={identifierFix[0]}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByTestId("edit-name-input")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-theme-selector-item-1"));
    });

    await waitFor(() => {
      expect(
        getByTestId("primary-button-edit-identifier").getAttribute("disabled")
      ).toBe("false");
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-edit-identifier"));
    });

    await waitFor(() => {
      expect(updateMock).toBeCalledTimes(1);
    });
  });
});
