import { CameraDirection } from "@capacitor-community/barcode-scanner";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { TabsRoutePath } from "../../../routes/paths";
import {
  setCameraDirection,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { OperationType } from "../../globals/types";
import { FullPageScanner } from "./FullPageScanner";

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

const isNativeMock = jest.fn();
jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => isNativeMock(),
    },
  };
});

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  isPlatform: () => true,
}));

const connectByOobiUrlMock = jest.fn();
const getMultisigLinkedContactsMock = jest.fn();
const createOrUpdateBasicRecordMock = jest.fn(() => Promise.resolve());
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        connectByOobiUrl: () => connectByOobiUrlMock(),
        getMultisigLinkedContacts: (args: any) =>
          getMultisigLinkedContactsMock(args),
      },
      basicStorage: {
        createOrUpdateBasicRecord: () => createOrUpdateBasicRecordMock(),
      },
    },
  },
}));

describe("Full page scanner", () => {
  beforeEach(() => {
    isNativeMock.mockImplementation(() => false);
    startScan.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            hasContent: true,
            content:
              "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          });
        }, 100);
      });
    });
  });

  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.SCAN],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
      currentOperation: OperationType.SCAN_WALLET_CONNECTION,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Renders content", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <FullPageScanner
          showScan={true}
          setShowScan={jest.fn()}
        />
      </Provider>
    );

    expect(getByTestId("qr-code-scanner")).toBeVisible();
    expect(getByTestId("scanner-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(getByTestId("qr-code-scanner")).toBeVisible();
      expect(getByTestId("secondary-button")).toBeVisible();
    });
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

    const setShowScanMock = jest.fn();

    render(
      <Provider store={storeMocked}>
        <FullPageScanner
          showScan={true}
          setShowScan={setShowScanMock}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(setShowScanMock).toBeCalled();
    });
  });

  test("Change direction", async () => {
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

    startScan.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            hasContent: true,
            content:
              "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          });
        }, 10000000);
      });
    });

    isNativeMock.mockImplementation(() => true);

    const setShowScanMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <FullPageScanner
          showScan={true}
          setShowScan={setShowScanMock}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordMock).toBeCalled();
      expect(dispatchMock).toBeCalledWith(
        setCameraDirection(CameraDirection.FRONT)
      );
    });
  });

  test("Close scan screen", async () => {
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

    const setShowScanMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <FullPageScanner
          showScan={true}
          setShowScan={setShowScanMock}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(setShowScanMock).toBeCalled();
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.IDLE)
      );
    });
  });
});
