import { IonInput } from "@ionic/react";
import { ionFireEvent } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import EN_Translation from "../../../locales/en/en.json";
import { setMultiSigGroupCache } from "../../../store/reducers/identifiersCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { OperationType, ToastMsgType } from "../../globals/types";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { Scanner } from "./Scanner";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) => (
    <div
      style={{ display: isOpen ? "block" : "none" }}
      {...props}
    >
      {children}
    </div>
  ),
}));

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

jest.mock("../CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <IonInput
        data-testid={props.dataTestId}
        onIonInput={(e) => {
          props.onChangeInput(e.detail.value as string);
        }}
      />
    );
  },
}));

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

describe("Scanner", () => {
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

  const setIsValueCaptured = jest.fn();

  test("Renders spinner", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    expect(getByTestId("qr-code-scanner")).toBeVisible();

    expect(getByTestId("scanner-spinner-container")).toBeVisible();
  });

  test("Renders content and input wallet connection pid", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("qr-code-scanner")).toBeVisible();
      expect(getByTestId("secondary-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button"));
    });

    await waitFor(() => {
      expect(getByTestId("scanner-input")).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("scanner-input"), "11111");
    });

    await waitFor(() => {
      expect(getByTestId("action-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.PEER_ID_SUCCESS)
      );
    });
  });

  test("Multisign initiator scan", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.MULTI_SIG_INITIATOR_SCAN,
      },
    };

    getMultisigLinkedContactsMock.mockReturnValue(connectionsFix);

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.MULTI_SIG_INITIATOR,
      };
    });

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.initiate)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_Translation.createidentifier.scan.initiate));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.MULTI_SIG_INITIATOR_INIT)
      );
      expect(getByTestId("create-identifier-modal")).toBeVisible();
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.NEW_MULTI_SIGN_MEMBER)
      );

      expect(dispatchMock).not.toBeCalledWith(
        setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING)
      );
    });
  });

  test("Multisign receiver scan", async () => {
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

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.NORMAL,
      };
    });

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    getMultisigLinkedContactsMock.mockReturnValue([connectionsFix[0]]);

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.pasteoobi)
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(handleReset).toBeCalled();
      expect(getMultisigLinkedContactsMock).toBeCalledWith("72e2f089cef6");
      expect(dispatchMock).toBeCalledWith(
        setMultiSigGroupCache({
          groupId: "72e2f089cef6",
          connections: [connectionsFix[0]],
        })
      );
    });
  });

  test("Scan page", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
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
    };

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.pastecontents)
      ).toBeVisible();
    });
  });
});
