import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Scan } from "./Scan";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import { OperationType } from "../../globals/types";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { connectionsFix } from "../../__fixtures__/connectionsFix";

const startScan = jest.fn(
  (args: any) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hasContent: true,
          content:
            "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
        });
      }, 100);
    })
);

jest.mock("@capacitor-community/barcode-scanner", () => {
  return {
    ...jest.requireActual("@capacitor-community/barcode-scanner"),
    BarcodeScanner: {
      checkPermission: () =>
        Promise.resolve({
          granted: true,
        }),
      hideBackground: jest.fn(),
      startScan: (args: any) => startScan(args),
      stopScan: jest.fn(),
      showBackground: jest.fn(),
    },
  };
});

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  isPlatform: () => true,
}));

const connectByOobiUrlMock = jest.fn();
const getMultisigLinkedContactsMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        connectByOobiUrl: () => connectByOobiUrlMock(),
        getMultisigLinkedContacts: (args: any) =>
          getMultisigLinkedContactsMock(args),
      },
    },
  },
}));

const historyPushMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: (args: any) => {
      historyPushMock(args);
    },
  }),
}));

describe("Scan Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  test("Renders Scan Tab", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Scan />
      </Provider>
    );

    expect(getByTestId("scan-tab")).toBeInTheDocument();
  });

  test("Reset after scan", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.MULTI_SIG_RECEIVER_SCAN,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.NORMAL,
      };
    });

    getMultisigLinkedContactsMock.mockReturnValue([connectionsFix[0]]);

    render(
      <Provider store={storeMocked}>
        <Scan />
      </Provider>
    );

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: undefined,
        state: {
          currentOperation: OperationType.MULTI_SIG_RECEIVER_SCAN,
          openConnections: false,
        },
      });
    });
  });
});
