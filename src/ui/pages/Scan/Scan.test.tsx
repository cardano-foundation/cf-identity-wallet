import {
  BarcodeFormat,
  BarcodeScannedEvent,
  BarcodeValueType,
} from "@capacitor-mlkit/barcode-scanning";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { TabsRoutePath } from "../../../routes/paths";
import { store } from "../../../store";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { OperationType } from "../../globals/types";
import { Scan } from "./Scan";

const addListener = jest.fn(
  (eventName: string, listenerFunc: (result: BarcodeScannedEvent) => void) => {
    setTimeout(() => {
      listenerFunc({
        barcode: {
          displayValue:
            "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          format: BarcodeFormat.QrCode,
          rawValue:
            "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          valueType: BarcodeValueType.Url,
        },
      });

      return {
        remove: jest.fn(),
      };
    }, 100);
  }
);

jest.mock("@capacitor-mlkit/barcode-scanning", () => {
  return {
    ...jest.requireActual("@capacitor-mlkit/barcode-scanning"),
    BarcodeScanner: {
      checkPermissions: () =>
        Promise.resolve({
          camera: "granted",
        }),
      addListener: (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => addListener(eventName, listenerFunc),
      startScan: jest.fn(),
      stopScan: jest.fn(),
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
        getMultisigLinkedContacts: (args: unknown) =>
          getMultisigLinkedContactsMock(args),
      },
    },
  },
}));

const historyPushMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: (args: unknown) => {
      historyPushMock(args);
    },
    location: {
      pathname: TabsRoutePath.SCAN,
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
      identifiersCache: {
        identifiers: [],
        scanGroupId: "72e2f089cef6",
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
        pathname: "",
        state: {
          currentOperation: OperationType.MULTI_SIG_RECEIVER_SCAN,
          toastMsg: undefined,
          openConnections: false,
          nextRoute: "",
        },
      });
    });
  });

  test("Nav back to previous page after scan", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN, TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_CONNECTION,
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

    const { rerender } = render(
      <Provider store={storeMocked}>
        <Scan />
      </Provider>
    );

    const updateState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN, TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.RECEIVE_CONNECTION,
      },
    };

    const updateStore = {
      ...mockStore(updateState),
      dispatch: dispatchMock,
    };

    rerender(
      <Provider store={updateStore}>
        <Scan />
      </Provider>
    );

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: TabsRoutePath.IDENTIFIERS,
        state: {
          currentOperation: OperationType.RECEIVE_CONNECTION,
          toastMsg: undefined,
          nextRoute: "/tabs/identifiers",
          openConnections: true,
        },
      });
    });
  });

  test("Nav to identifier after scan multisig", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN, TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.IDLE,
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
      expect(historyPushMock).toBeCalledWith(TabsRoutePath.IDENTIFIERS);
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.OPEN_MULTISIG_IDENTIFIER)
      );
    });
  });
});
