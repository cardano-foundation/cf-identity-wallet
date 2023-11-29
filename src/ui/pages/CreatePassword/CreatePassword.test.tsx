import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { CreatePassword } from "./CreatePassword";

describe("Create Password Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {};

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
  test("Renders Create Password page", () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreatePassword />
      </Provider>
    );
    const createPasswordValue = getByTestId("createPasswordValue");
    const confirmPasswordValue = getByTestId("createPasswordValue");
    const createHintValue = getByTestId("createPasswordValue");
    expect(createPasswordValue).toBeInTheDocument();
    expect(confirmPasswordValue).toBeInTheDocument();
    expect(createHintValue).toBeInTheDocument();
  });
});
