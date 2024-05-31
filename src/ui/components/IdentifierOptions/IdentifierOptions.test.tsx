import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { act } from "react-dom/test-utils";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { IdentifierOptions } from "./IdentifierOptions";
import { TabsRoutePath } from "../navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

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

describe("Identifier Options modal", () => {
  const dispatchMock = jest.fn();
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
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("should display the elements inside the modal", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
          handleDeleteIdentifier={async () => {
            jest.fn();
          }}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("view-json-identifier-options")).toBeVisible();
    expect(getByTestId("edit-identifier-options")).toBeVisible();
    expect(getByTestId("share-identifier-options")).toBeVisible();
    expect(getByTestId("delete-identifier-options")).toBeVisible();
  });
});

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

describe("Identifier Options function test", () => {
  const dispatchMock = jest.fn();
  let mockedStore: Store<unknown, AnyAction>;
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

  test("Display JSON view", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
          handleDeleteIdentifier={async () => {
            jest.fn();
          }}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("view-json-identifier-options")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("view-json-identifier-options"));
    });

    await waitFor(() => {
      expect(setIdentifierOptionsIsOpen).toBeCalledTimes(1);
    });

    expect(getByTestId("identifier-content").innerHTML).toBe(
      JSON.stringify(identifierFix[0], null, 2)
    );
    expect(getByTestId("identifier-copy-json")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-copy-json"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
      );
    });
  });

  test("Open edit modal view", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId, getAllByText } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
          handleDeleteIdentifier={async () => {
            jest.fn();
          }}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("edit-identifier-options")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("edit-identifier-options"));
    });

    await waitFor(() => {
      expect(setIdentifierOptionsIsOpen).toBeCalledTimes(1);
    });

    expect(
      getAllByText(EN_TRANSLATIONS.identifiers.details.options.edit)[0]
    ).toBeVisible();
    expect(getByTestId("identifier-copy-json")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-theme-selector-item-1"));
    });

    await waitFor(() => {
      expect(getByTestId("continue-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("continue-button"));
    });

    await waitFor(() => {
      expect(updateMock).toBeCalledTimes(1);
    });
  });

  test("Delete identifier", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const mockDelete = jest.fn();
    const { getByTestId, getAllByText } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
          handleDeleteIdentifier={mockDelete}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("delete-identifier-options")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("delete-identifier-options"));
    });

    await waitFor(() => {
      expect(mockDelete).toBeCalledTimes(1);
    });
  });
});
