import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { TabsRoutePath } from "../../../routes/paths";
import { OperationType } from "../../globals/types";
import { FullPageScanner } from "./FullPageScanner";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { setCurrentOperation } from "../../../store/reducers/stateCache";

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

describe("Full page scanner", () => {
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
