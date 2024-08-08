import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { store } from "../../../../../store";
import { i18n } from "../../../../../i18n";
import { ConnectionsOptionModal } from "./ConnectionsOptionModal";
import { RequestType, OperationType } from "../../../../globals/types";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";

describe("Connection modal", () => {
  test("It renders connection modal", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ConnectionsOptionModal
          type={RequestType.CONNECTION}
          connectModalIsOpen={true}
          setConnectModalIsOpen={jest.fn()}
          handleProvideQr={jest.fn()}
        />
      </Provider>
    );
    const title = getByText(
      `${
        i18n.t("connectmodal.title") +
        " " +
        RequestType.CONNECTION.toLowerCase()
      }`
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
        <ConnectionsOptionModal
          type={RequestType.CONNECTION}
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
      setCurrentOperation(OperationType.SCAN_CONNECTION)
    );
  });

  test("It should open share a QR code component successfully", async () => {
    const handleProvideQr = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <ConnectionsOptionModal
          type={RequestType.CONNECTION}
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
