import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { CreateIdentity } from "./CreateIdentity";
import { filteredIdentityFix } from "../../__fixtures__/filteredIdentityFix";

jest.mock("../../../core/agent/agent");
describe("Create Identity modal", () => {
  const mockOnClose = jest.fn();

  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      didsCache: {
        dids: filteredIdentityFix,
      },
      identitiesCache: {
        identities: [],
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
        <CreateIdentity
          modalIsOpen={true}
          setModalIsOpen={mockOnClose}
        />
      </Provider>
    );
    expect(getByTestId("create-identity-modal")).toBeInTheDocument();
  });

  test.skip("should display the elements inside the modal", () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <CreateIdentity
          modalIsOpen={true}
          setModalIsOpen={mockOnClose}
        />
      </Provider>
    );
    expect(getByTestId("identity-type-selector")).toBeInTheDocument();
    expect(getByTestId("identity-theme-selector")).toBeInTheDocument();
  });
});
