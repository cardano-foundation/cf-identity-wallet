import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { IdentifierOptions } from "./IdentifierOptions";
import { TabsRoutePath } from "../navigation/TabsMenu";

jest.mock("../../../core/agent/agent");

describe("Identifier Options modal", () => {
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
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

  test("should display the modal", () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
        />
      </Provider>
    );
    expect(getByTestId("identifier-options-modal")).toBeInTheDocument();
  });

  test.skip("should display the elements inside the modal", () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifierOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentifierOptionsIsOpen}
          cardData={identifierFix[0]}
          setCardData={setCardData}
        />
      </Provider>
    );

    expect(getByTestId("identifier-options-view-button")).toBeInTheDocument();
    expect(
      getByTestId("identifier-options-identifier-options-button")
    ).toBeInTheDocument();
    expect(getByTestId("identifier-options-share-button")).toBeInTheDocument();
    expect(getByTestId("identifier-options-delete-button")).toBeInTheDocument();
  });
});
