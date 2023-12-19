import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { OutOfBandInvitation, OutOfBandRecord } from "@aries-framework/core";
import { store } from "../../../store";
import { AriesAgent } from "../../../core/agent/agent";
import { Connections } from "./Connections";
jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      connections: {
        createMediatorInvitation: jest.fn(),
        getShortenUrl: jest.fn(),
      },
    },
  },
}));

const mockSetShowConnections = jest.fn();
describe("Connections page", () => {
  test("It renders connections page successfully", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Connections
          setShowConnections={mockSetShowConnections}
          showConnections={true}
        />
      </Provider>
    );
    const addConnectionBtn = getByTestId("add-connection-button");
    expect(addConnectionBtn).toBeInTheDocument();
    const title = getByTestId("tab-title-connections");
    expect(title).toBeInTheDocument();
  });

  test("It renders connection modal successfully", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Connections
          setShowConnections={mockSetShowConnections}
          showConnections={true}
        />
      </Provider>
    );
    const addConnectionBtn = getByTestId("add-connection-button");
    act(() => {
      fireEvent.click(addConnectionBtn);
    });
    expect(
      getByTestId("add-connection-modal-provide-qr-code")
    ).toBeInTheDocument();
  });

  test("It renders QR code successfully", async () => {
    jest
      .spyOn(AriesAgent.agent.connections, "createMediatorInvitation")
      .mockResolvedValue({
        invitationUrl: "http://example.com?oob=abc123",
        record: {} as OutOfBandRecord,
        invitation: {} as OutOfBandInvitation,
      });
    jest
      .spyOn(AriesAgent.agent.connections, "getShortenUrl")
      .mockResolvedValue("http://example.com/shorten/123");
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Connections
          setShowConnections={mockSetShowConnections}
          showConnections={true}
        />
      </Provider>
    );
    const addConnectionBtn = getByTestId("add-connection-button");
    act(() => {
      fireEvent.click(addConnectionBtn);
    });
    const qrCodeBtn = getByTestId("add-connection-modal-provide-qr-code");
    expect(qrCodeBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(qrCodeBtn);
    });
    await waitFor(() => {
      expect(qrCodeBtn).not.toBeInTheDocument();
      expect(getByText("http://example.com/shorten/123")).toBeInTheDocument();
    });
  });
});
