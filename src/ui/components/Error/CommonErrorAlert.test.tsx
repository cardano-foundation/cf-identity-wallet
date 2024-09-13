import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import { AppCommonErrorAlert } from "./CommonErrorAlert";
import ENG_TRANS from "../../../locales/en/en.json";
import { showCommonError } from "../../../store/reducers/stateCache";

const dispatchMock = jest.fn();
describe("Common error alert", () => {
  let mockedStore: Store<unknown, AnyAction>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        showCommonError: true,
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Register keyboard event when render app", async () => {
    const { getByText } = render(
      <Provider store={mockedStore}>
        <AppCommonErrorAlert />
      </Provider>
    );

    await waitFor(() => {
      getByText(ENG_TRANS.error.text);
    });

    act(() => {
      fireEvent.click(getByText(ENG_TRANS.error.button));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showCommonError(false));
    });
  });
});
