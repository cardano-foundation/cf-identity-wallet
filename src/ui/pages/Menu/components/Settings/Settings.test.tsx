import {
  BiometryErrorType,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act, useState } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Agent } from "../../../../../core/agent/agent";
import { MiscRecordId } from "../../../../../core/agent/agent.types";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { store } from "../../../../../store";
import {
  DISCORD_LINK,
  DOCUMENTATION_LINK,
} from "../../../../globals/constants";
import { passcodeFiller } from "../../../../utils/passcodeFiller";
import { SubMenuKey } from "../../Menu.types";
import { Settings } from "./Settings";
import { OptionIndex } from "./Settings.types";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: (props: any) => (
    <div
      data-testid={props["data-testid"]}
      style={{ display: props.isOpen ? "block" : "none" }}
    >
      {props.children}
    </div>
  ),
}));

jest.mock("../../../../../core/storage", () => ({
  ...jest.requireActual("../../../../../core/storage"),
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
  },
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

let useBiometricAuthMock = jest.fn(() => {
  const [biometricsIsEnabled, setBiometricsIsEnabled] = useState(true);

  return {
    biometricsIsEnabled,
    biometricInfo: {
      isAvailable: true,
      hasCredentials: false,
      biometryType: BiometryType.fingerprintAuthentication,
      strongBiometryIsAvailable: true,
    },
    handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
    setBiometricsIsEnabled,
  };
});

jest.mock("../../../../hooks/useBiometricsHook", () => {
  return {
    useBiometricAuth: () => useBiometricAuthMock(),
  };
});

const openSettingMock = jest.fn(() => Promise.resolve(true));

jest.mock("capacitor-native-settings", () => ({
  ...jest.requireActual("capacitor-native-settings"),
  NativeSettings: {
    open: () => openSettingMock(),
  },
}));

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createOrUpdateBasicRecord: jest.fn(),
      },
    },
  },
}));

describe("Settings page", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("Renders Settings page", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.title)
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.changepin.title
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.biometry
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.managepassword
          .title
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.seedphrase
          .title
      )
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.contact)
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.learnmore
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.terms.title
      )
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.version)
    ).toBeInTheDocument();
  });

  test("Enable biometrics toggle", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
      },
      biometricsCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.biometry
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("settings-item-0"));
    });

    await waitFor(() => {
      expect(getByTestId("verify-passcode-content-page")).toBeVisible();
    });

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(Agent.agent.basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });
  });

  test("Disable biometrics toggle", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
      },
      biometricsCache: {
        enabled: true,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.biometry
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("settings-item-0"));
    });

    await waitFor(() => {
      expect(
        Agent.agent.basicStorage.createOrUpdateBasicRecord
      ).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(Agent.agent.basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: false,
          },
        })
      );
    });
  });

  test("Open setting page when biometrics not enroll", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
      },
      biometricsCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    useBiometricAuthMock = jest.fn(() => {
      const [biometricsIsEnabled, setBiometricsIsEnabled] = useState(true);

      return {
        biometricsIsEnabled,
        biometricInfo: {
          isAvailable: true,
          hasCredentials: false,
          biometryType: BiometryType.fingerprintAuthentication,
          strongBiometryIsAvailable: false,
          code: BiometryErrorType.biometryNotEnrolled,
        },
        handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
        setBiometricsIsEnabled,
      };
    });

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.biometry
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("settings-item-0"));
    });

    await waitFor(() => {
      expect(openSettingMock).toBeCalledTimes(1);
    });
  });

  test("Open discord and documentation link", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.contact)
    ).toBeInTheDocument();

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.learnmore
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId(`settings-item-${OptionIndex.Contact}`));
    });

    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: DISCORD_LINK,
      });
    });

    act(() => {
      fireEvent.click(
        getByTestId(`settings-item-${OptionIndex.Documentation}`)
      );
    });

    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: DOCUMENTATION_LINK,
      });
    });
  });

  test("Switch page", async () => {
    const switchViewMock = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Settings switchView={switchViewMock} />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.support.terms.title
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId(`settings-item-${OptionIndex.Term}`));
    });

    await waitFor(() => {
      expect(switchViewMock).toBeCalledWith(SubMenuKey.TermsAndPrivacy);
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.managepassword
          .title
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        getByTestId(`settings-item-${OptionIndex.ManagePassword}`)
      );
    });

    await waitFor(() => {
      expect(switchViewMock).toBeCalledWith(SubMenuKey.ManagePassword);
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.seedphrase
          .title
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        getByTestId(`settings-item-${OptionIndex.RecoverySeedPhrase}`)
      );
    });

    await waitFor(() => {
      expect(switchViewMock).toBeCalledWith(SubMenuKey.RecoverySeedPhrase);
    });
  });

  test("Open change passcode", async () => {
    const switchViewMock = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Settings switchView={switchViewMock} />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.changepin.title
      )
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId(`settings-item-${OptionIndex.ChangePin}`));
    });

    await waitFor(() => {
      expect(getByTestId("verify-passcode")).toBeVisible();
    });

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.menu.tab.settings.sections.security.changepin
            .createpasscode
        )
      ).toBeVisible();
    });
  });
});
