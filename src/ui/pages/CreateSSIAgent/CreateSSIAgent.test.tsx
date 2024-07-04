import { Provider } from "react-redux";
import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { IonButton, IonIcon, IonInput, IonLabel } from "@ionic/react";
import { act } from "react-dom/test-utils";
import { ionFireEvent } from "@ionic/react-test-utils";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { createMemoryHistory } from "history";
import { CreateSSIAgent } from "./CreateSSIAgent";
import ENG_Trans from "../../../locales/en/en.json";
import { CustomInputProps } from "../../components/CustomInput/CustomInput.types";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { setBootUrl, setConnectUrl } from "../../../store/reducers/ssiAgent";
import { RoutePath } from "../../../routes";
import { MiscRecordId } from "../../../core/agent/agent.types";

const bootAndConnectMock = jest.fn((...args: any) => Promise.resolve());
const recoverKeriaAgentMock = jest.fn();
const basicStorageDeleteMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    ...jest.requireActual("../../../core/agent/agent"),
    agent: {
      bootAndConnect: (...args: any) => bootAndConnectMock(...args),
      recoverKeriaAgent: (...args: any) => recoverKeriaAgentMock(...args),
      basicStorage: {
        deleteById: (...args: any) => basicStorageDeleteMock(...args),
      },
    },
  },
}));

jest.mock("../../components/CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <>
        <IonLabel
          position="stacked"
          data-testid={`${props.title?.toLowerCase().replace(" ", "-")}-title`}
        >
          {props.title}
          {props.optional && (
            <span className="custom-input-optional">(optional)</span>
          )}
        </IonLabel>
        <IonInput
          data-testid={props.dataTestId}
          onIonInput={(e) => {
            props.onChangeInput(e.detail.value as string);
          }}
          onIonFocus={() => props.onChangeFocus?.(true)}
          onIonBlur={() => props.onChangeFocus?.(false)}
        />
        {props.action && props.actionIcon && (
          <IonButton
            shape="round"
            data-testid={`${props.dataTestId}-action`}
            onClick={(e) => {
              props.action?.(e);
            }}
          >
            <IonIcon
              slot="icon-only"
              icon={props.actionIcon}
              color="primary"
            />
          </IonButton>
        )}
      </>
    );
  },
}));

const secureStorageDeleteFunc = jest.fn();

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    delete: (...args: any) => secureStorageDeleteFunc(...args),
  },
}));

describe("SSI agent page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    ssiAgentCache: {
      bootUrl: undefined,
      connectUrl: undefined,
    },
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        recoveryWalletProgress: false,
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Renders ssi agent page", () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    expect(getByText(ENG_Trans.ssiagent.title)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.description)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.button.info)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.button.validate)).toBeVisible();
    expect(
      getByText(ENG_Trans.ssiagent.button.validate).getAttribute("disabled")
    ).toBe("true");

    expect(getByTestId("boot-url-input")).toBeVisible();
    expect(getByTestId("connect-url-input")).toBeVisible();
  });

  test("Open scanner", () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("boot-url-input-action"));
    });

    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(OperationType.SCAN_SSI_BOOT_URL)
    );

    act(() => {
      fireEvent.click(getByTestId("connect-url-input-action"));
    });

    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(OperationType.SCAN_SSI_CONNECT_URL)
    );
  });

  test("Change store after input url", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionInput(getByTestId("boot-url-input"), "11111");
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setBootUrl("11111"));
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("connect-url-input"), "11111");
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setConnectUrl("11111"));
    });
  });

  test("Display error when input invalid boot url", async () => {
    const mockStore = configureStore();
    const initialState = {
      ssiAgentCache: {
        bootUrl: "11111",
        connectUrl: undefined,
      },
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          recoveryWalletProgress: false,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionFocus(getByTestId("boot-url-input"));
    });

    await waitFor(() => {
      expect(getByText(ENG_Trans.ssiagent.error.invalidbooturl)).toBeVisible();
    });
  });

  test("Display error when input invalid connect url", async () => {
    const mockStore = configureStore();
    const initialState = {
      ssiAgentCache: {
        bootUrl: undefined,
        connectUrl: "11111",
      },
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          recoveryWalletProgress: false,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionFocus(getByTestId("connect-url-input"));
    });

    await waitFor(() => {
      expect(
        getByText(ENG_Trans.ssiagent.error.invalidconnecturl)
      ).toBeVisible();
    });
  });

  test("Remove last slash", async () => {
    const mockStore = configureStore();
    const initialState = {
      ssiAgentCache: {
        bootUrl: undefined,
        connectUrl: "https://connectUrl.com/",
      },
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          recoveryWalletProgress: false,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionBlur(getByTestId("connect-url-input"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setConnectUrl("https://connectUrl.com")
      );
    });
  });

  test("Display error when input invalid urls", async () => {
    const mockStore = configureStore();
    const initialState = {
      ssiAgentCache: {
        bootUrl: "11111",
        connectUrl: "11111",
      },
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          recoveryWalletProgress: false,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getAllByText } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionFocus(getByTestId("boot-url-input"));
      ionFireEvent.ionFocus(getByTestId("connect-url-input"));
    });

    await waitFor(() => {
      expect(getAllByText(ENG_Trans.ssiagent.error.invalidurl).length).toBe(2);
    });
  });

  test("Connect and boot success", async () => {
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: true,
          passwordIsSet: true,
          passwordIsSkipped: true,
          loggedIn: false,
          userName: "",
          time: 0,
          ssiAgentIsSet: false,
        },
      },
      ssiAgentCache: {
        bootUrl:
          "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org",
        connectUrl:
          "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org",
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    history.push(RoutePath.SSI_AGENT);

    const { getByTestId } = render(
      <IonReactMemoryRouter history={history}>
        <Provider store={storeMocked}>
          <CreateSSIAgent />
        </Provider>
      </IonReactMemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("primary-button-create-ssi-agent"));
    });

    expect(bootAndConnectMock).toBeCalledWith({
      bootUrl:
        "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org",
      url: "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org",
    });
  });
});

describe("SSI agent page: recovery mode", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    ssiAgentCache: {
      bootUrl: undefined,
      connectUrl: undefined,
    },
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        recoveryWalletProgress: true,
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Renders ssi agent page", () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    expect(getByText(ENG_Trans.ssiagent.title)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.verifydescription)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.button.info)).toBeVisible();
    expect(getByText(ENG_Trans.ssiagent.button.validate)).toBeVisible();
    expect(
      getByText(ENG_Trans.ssiagent.button.validate).getAttribute("disabled")
    ).toBe("true");

    expect(queryByTestId("boot-url-input")).toBe(null);
    expect(getByTestId("connect-url-input")).toBeVisible();
  });

  test("Connect and boot success", async () => {
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: true,
          passwordIsSet: true,
          passwordIsSkipped: true,
          loggedIn: false,
          userName: "",
          time: 0,
          ssiAgentIsSet: false,
          recoveryWalletProgress: true,
        },
      },
      ssiAgentCache: {
        bootUrl:
          "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org",
        connectUrl:
          "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org",
      },
      seedPhraseCache: {
        seedPhrase: "mock-seed",
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    history.push(RoutePath.SSI_AGENT);

    const { getByTestId } = render(
      <IonReactMemoryRouter history={history}>
        <Provider store={storeMocked}>
          <CreateSSIAgent />
        </Provider>
      </IonReactMemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("primary-button-create-ssi-agent"));
    });

    await waitFor(() => {
      expect(basicStorageDeleteMock).toBeCalledWith(
        MiscRecordId.APP_RECOVERY_WALLET
      );
    });
  });
});
