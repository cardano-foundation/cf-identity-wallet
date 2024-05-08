import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";
import { OperationType } from "../../../../globals/types";
import { ConnectWalletActions } from "./ConnectWalletActions";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div
      style={{ display: isOpen ? "block" : "none" }}
      data-testid="add-connection-modal"
    >
      {children}
    </div>
  ),
}));

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
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Connect wallet actions modal", () => {
  test("Render connect wallet actions", async () => {
    const closeFn = jest.fn();
    const openInputPidFn = jest.fn();

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ConnectWalletActions
          openModal={true}
          closeModal={closeFn}
          onInputPid={openInputPidFn}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.connectwallet.connectwalletmodal.scanqr)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.connectwallet.connectwalletmodal.pastePID)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("connect-wallet-modal-scan-qr-code"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.SCAN_CONNECTION)
      );
    });

    act(() => {
      fireEvent.click(getByTestId("connect-wallet-modal-input-pid"));
    });

    await waitFor(() => {
      expect(openInputPidFn).toBeCalled();
    });
  });
});
