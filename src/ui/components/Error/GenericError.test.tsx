import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import { GenericError } from "./GenericError";
import TRANSLATIONS from "../../../locales/en/en.json";
import { showGenericError } from "../../../store/reducers/stateCache";

const dispatchMock = jest.fn();
describe("Common error alert", () => {
  let mockedStore: Store<unknown, AnyAction>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        showGenericError: true,
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
        <GenericError />
      </Provider>
    );

    await waitFor(() => {
      getByText(TRANSLATIONS.genericerror.text);
    });

    act(() => {
      fireEvent.click(getByText(TRANSLATIONS.genericerror.button));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showGenericError(false));
    });
  });
});
