import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { CreateIdentity } from "./CreateIdentity";
import { filteredDidsMock } from "../../__mocks__/filteredDidsMock";
jest.mock("../../../utils", () => ({
  generateUUID: jest.fn(),
}));
jest.mock("../../../core/aries/ariesAgent.ts", () => ({
  AriesAgent: {
    agent: {
      getIdentity: jest.fn().mockResolvedValue({}),
    },
  },
}));
describe("Create Identity modal", () => {
  const mockOnClose = jest.fn();

  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      didsCache: {
        dids: filteredDidsMock,
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
});
