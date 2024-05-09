import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Connections } from "./Connections";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { formatShortDate } from "../../utils/formatters";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        createMediatorInvitation: jest.fn(),
        getShortenUrl: jest.fn(),
      },
    },
  },
}));

const mockSetShowConnections = jest.fn();

const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: filteredCredsFix,
    favourites: [
      {
        id: filteredCredsFix[0].id,
        time: 1,
      },
    ],
  },
  connectionsCache: {
    connections: connectionsFix,
  },
};

let mockedStore: Store<unknown, AnyAction>;

describe("Connections page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
  });

  test("It renders connections page successfully", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={mockedStore}>
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
    expect(getByText(connectionsFix[0].label)).toBeInTheDocument();
    expect(
      getByText(formatShortDate(connectionsFix[0].connectionDate))
    ).toBeInTheDocument();
    expect(getAllByText(connectionsFix[0].status)[0]).toBeInTheDocument();
  });

  test.skip("It renders connection modal successfully", async () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
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

  test.skip("It renders QR code successfully", async () => {
    // jest
    //   .spyOn(Agent.agent.connections, "createMediatorInvitation")
    //   .mockResolvedValue({
    //     invitationUrl: "http://example.com?oob=abc123",
    //     record: {} as OutOfBandRecord,
    //     invitation: {} as OutOfBandInvitation,
    //   });
    // jest
    //   .spyOn(Agent.agent.connections, "getShortenUrl")
    //   .mockResolvedValue("http://example.com/shorten/123");
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
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
