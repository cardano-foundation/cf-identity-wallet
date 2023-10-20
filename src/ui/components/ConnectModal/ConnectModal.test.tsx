import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { OutOfBandInvitation, OutOfBandRecord } from "@aries-framework/core";
import { store } from "../../../store";
import { i18n } from "../../../i18n";
import { ConnectModal } from "./ConnectModal";
import { connectionType, operationState } from "../../constants/dictionary";
import { setCurrentOperation } from "../../../store/reducers/stateCache";

describe("Connection modal", () => {
  test("It renders connection modal", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ConnectModal
          type={connectionType.connection}
          connectModalIsOpen={true}
          setConnectModalIsOpen={jest.fn()}
          handleProvideQr={jest.fn()}
        />
      </Provider>
    );
    const title = getByText(
      `${i18n.t("connectmodal.title") + connectionType.connection}`
    );
    expect(title).toBeInTheDocument();
  });

  test("It should open scan a QR code component successfully", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const storeMocked = {
      ...mockStore(store.getState()),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectModal
          type={connectionType.connection}
          connectModalIsOpen={true}
          setConnectModalIsOpen={jest.fn()}
          handleProvideQr={jest.fn()}
        />
      </Provider>
    );
    const btn = getByTestId("add-connection-modal-scan-qr-code");
    act(() => {
      fireEvent.click(btn);
    });
    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(operationState.scanConnection)
    );
  });

  test("It should open share a QR code component successfully", async () => {
    const handleProvideQr = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <ConnectModal
          type={connectionType.connection}
          connectModalIsOpen={true}
          setConnectModalIsOpen={jest.fn()}
          handleProvideQr={handleProvideQr}
        />
      </Provider>
    );
    const btn = getByTestId("add-connection-modal-provide-qr-code");
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => {
      expect(handleProvideQr).toBeCalled();
    });
  });
});
