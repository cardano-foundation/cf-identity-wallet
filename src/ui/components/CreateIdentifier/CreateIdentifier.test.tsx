import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { CreateIdentifier } from "./CreateIdentifier";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";

jest.mock("../../../core/agent/agent");
describe("Create Identifier modal", () => {
  const mockOnClose = jest.fn();

  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
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
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={mockOnClose}
        />
      </Provider>
    );
    expect(getByTestId("create-identifier-modal")).toBeInTheDocument();
  });

  test.skip("should display the elements inside the modal", () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={mockOnClose}
        />
      </Provider>
    );
    expect(getByTestId("identifier-type-selector")).toBeInTheDocument();
    expect(getByTestId("identifier-theme-selector")).toBeInTheDocument();
  });
});
