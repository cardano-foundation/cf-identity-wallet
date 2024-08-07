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
          handleRotateKey={jest.fn()}
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

    expect(getByTestId("edit-identifier-option")).toBeVisible();
    expect(getByTestId("rotate-keys-option")).toBeVisible();
    expect(getByTestId("share-identifier-option")).toBeVisible();
    expect(getByTestId("delete-identifier-option")).toBeVisible();
  });

  test("should not display the rotate-keys-option inside the modal", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { queryByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          handleRotateKey={jest.fn()}
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[2]}
          setCardData={setCardData}
          handleDeleteIdentifier={async () => {
            jest.fn();
          }}
        />
      </Provider>
    );
    await waitForIonicReact();

    await waitFor(() => expect(queryByTestId("rotate-keys-option")).toBe(null));
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

  test("Open edit modal view", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId, getAllByText } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          handleRotateKey={jest.fn()}
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

    expect(getByTestId("edit-identifier-option")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("edit-identifier-option"));
    });

    await waitFor(() => {
      expect(setIdentifierOptionsIsOpen).toBeCalledTimes(1);
    });

    expect(
      getAllByText(EN_TRANSLATIONS.identifiers.details.options.edit)[0]
    ).toBeVisible();

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
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          handleRotateKey={jest.fn()}
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
          handleDeleteIdentifier={mockDelete}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("delete-identifier-option")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("delete-identifier-option"));
    });

    await waitFor(() => {
      expect(mockDelete).toBeCalledTimes(1);
    });
  });
});
