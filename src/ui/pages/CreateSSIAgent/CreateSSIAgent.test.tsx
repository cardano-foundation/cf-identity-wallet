import { IonButton, IonIcon, IonInput, IonLabel } from "@ionic/react";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { ionFireEvent } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MiscRecordId } from "../../../core/agent/agent.types";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { setBootUrl, setConnectUrl } from "../../../store/reducers/ssiAgent";
import { setCurrentOperation, setToastMsg } from "../../../store/reducers/stateCache";
import { CustomInputProps } from "../../components/CustomInput/CustomInput.types";
import {
  ONBOARDING_DOCUMENTATION_LINK,
  RECOVERY_DOCUMENTATION_LINK,
} from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { CreateSSIAgent } from "./CreateSSIAgent";
import { Agent } from "../../../core/agent/agent";

const bootAndConnectMock = jest.fn((...args: unknown[]) => Promise.resolve(args));
const recoverKeriaAgentMock = jest.fn();
const basicStorageDeleteMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  ...jest.requireActual("../../../core/agent/agent"),
  Agent: {
    KERIA_CONNECTION_BROKEN :
    "The app is not connected to KERIA at the moment",
    KERIA_BOOT_FAILED_BAD_NETWORK :
    "Failed to boot due to network connectivity",
    KERIA_CONNECT_FAILED_BAD_NETWORK :
    "Failed to connect due to network connectivity",
    KERIA_BOOT_FAILED : "Failed to boot signify client",
    KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT :
    "KERIA agent is already booted but cannot connect",
    KERIA_NOT_BOOTED :
    "Agent has not been booted for a given Signify passcode",
    INVALID_MNEMONIC : "Seed phrase is invalid",
    MISSING_DATA_ON_KERIA :
    "Attempted to fetch data by ID on KERIA, but was not found. May indicate stale data records in the local database.",
    agent: {
      bootAndConnect: (...args: unknown[]) => bootAndConnectMock(...args),
      recoverKeriaAgent: (...args: unknown[]) => recoverKeriaAgentMock(...args),
      basicStorage: {
        deleteById: (...args: unknown[]) => basicStorageDeleteMock(...args),
      },
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, ...props }: any) => {
    const testId = props["data-testid"];

    return <div data-testid={testId}>{children}</div>;
  }
}));

const browserMock = jest.fn(({ link }: { link: string }) =>
  Promise.resolve(link)
);
jest.mock("@capacitor/browser", () => ({
  ...jest.requireActual("@capacitor/browser"),
  Browser: {
    open: (params: never) => browserMock(params),
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
    delete: (...args: unknown[]) => secureStorageDeleteFunc(...args),
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

    expect(getByText(EN_TRANSLATIONS.ssiagent.title)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.description)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.button.info)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.button.validate)).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.ssiagent.button.validate).getAttribute(
        "disabled"
      )
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
      expect(
        getByText(EN_TRANSLATIONS.ssiagent.error.invalidbooturl)
      ).toBeVisible();
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
        getByText(EN_TRANSLATIONS.ssiagent.error.invalidconnecturl)
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

    const { getByTestId } = render(
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
      expect(
        getAllByText(EN_TRANSLATIONS.ssiagent.error.invalidurl).length
      ).toBe(2);
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

    await waitFor(() => {
      expect(getByTestId("ssi-spinner-container")).toBeVisible();
    })
  });

  test("Open SSI Agent info modal (Onboarding)", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.aboutssiagentcreate.intro.title)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.aboutssiagentcreate.sections[0].content[0].text)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.aboutssiagentcreate.sections[0].content[1].text)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.ssiagent.button.onboardingdocumentation)
    ).toBeVisible();
    act(() => {
      fireEvent.click(getByTestId("open-ssi-documentation-button"));
    });
    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: ONBOARDING_DOCUMENTATION_LINK,
      });
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

    expect(getByText(EN_TRANSLATIONS.ssiagent.title)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.verifydescription)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.button.info)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.ssiagent.button.validate)).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.ssiagent.button.validate).getAttribute(
        "disabled"
      )
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

  test("Open SSI Agent info modal (Recovery)", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateSSIAgent />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.aboutssiagentrecovery.intro.title)
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.aboutssiagentrecovery.sections[0].content[0].text
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.aboutssiagentrecovery.sections[0].content[1].text
      )
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.ssiagent.button.recoverydocumentation)
    ).toBeVisible();
    act(() => {
      fireEvent.click(getByTestId("open-ssi-documentation-button"));
    });
    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: RECOVERY_DOCUMENTATION_LINK,
      });
    });
  });
});

describe("SSI agent page: show error", () => {
  const dispatchMock = jest.fn();

  test("Invalid boot url", async () => {
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
          recoveryWalletProgress: false,
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

    bootAndConnectMock.mockImplementation(() => Promise.reject(new Error(Agent.KERIA_BOOT_FAILED)))

    const { getByTestId, getByText } = render(
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
      expect(getByText(EN_TRANSLATIONS.ssiagent.error.invalidbooturl)).toBeVisible();
    });
  });

  test("Invalid connect url", async () => {
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
          recoveryWalletProgress: false,
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

    bootAndConnectMock.mockImplementation(() => Promise.reject(new Error(Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT)))

    const { getByTestId, getByText } = render(
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
      expect(getByText(EN_TRANSLATIONS.ssiagent.error.invalidconnecturl)).toBeVisible();
    });
  });

  test("Mismatch url", async () => {
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
          recoveryWalletProgress: false,
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

    bootAndConnectMock.mockImplementation(() => Promise.reject(new Error(Agent.KERIA_NOT_BOOTED)))

    const { getByTestId, getByText } = render(
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
      expect(getByText(EN_TRANSLATIONS.ssiagent.error.mismatchconnecturl)).toBeVisible();
    });
  });


  test("Network error", async () => {
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
          recoveryWalletProgress: false,
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

    bootAndConnectMock.mockImplementation(() => Promise.reject(new Error(Agent.KERIA_BOOT_FAILED_BAD_NETWORK)))

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
      expect(dispatchMock).toBeCalledWith(setToastMsg(ToastMsgType.UNKNOWN_ERROR));
    });
  });
})