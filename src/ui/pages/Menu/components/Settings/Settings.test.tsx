import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { useState } from "react";
import { Settings } from "./Settings";
import { store } from "../../../../../store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { MiscRecordId } from "../../../../../core/agent/agent.types";

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    },
  },
}));

const createOrUpdateBasicRecordSpy = jest.spyOn(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("../../../../../core/agent/records/createOrUpdateBasicRecord"),
  "createOrUpdateBasicRecord"
);

jest.mock("../../../../hooks/useBiometricsHook", () => {
  return {
    useBiometricAuth: () => {
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
    },
  };
});

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
      getByText(EN_TRANSLATIONS.settings.sections.security.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.changepin)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.biometry)
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.settings.sections.security.manageoperationspassword
      )
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.seedphrase)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.contact)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.troubleshooting)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.learnmore)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.terms)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.version)
    ).toBeInTheDocument();
  });

  test("Disable/enable biometrics toggle", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.biometry)
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("security-item-0"));
    });
    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: false,
          },
        })
      );
    });

    act(() => {
      fireEvent.click(getByTestId("security-item-0"));
    });
    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledTimes(2);
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });
  });
});
