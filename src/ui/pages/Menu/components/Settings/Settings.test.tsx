import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { Settings } from "./Settings";
import { store } from "../../../../../store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../../../core/storage";
const setPreferenceStorageSpy = jest
  .spyOn(PreferencesStorage, "set")
  .mockResolvedValue();

jest.mock("../../../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: jest.fn(() => ({
    biometricsIsEnabled: true,
    biometricInfo: {
      isAvailable: true,
      hasCredentials: false,
      biometryType: BiometryType.fingerprintAuthentication,
      strongBiometryIsAvailable: true,
    },
    handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
    setBiometricsIsEnabled: jest.fn(),
  })),
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

    act(() => {
      fireEvent.click(getByTestId("security-item-0"));
    });

    expect(setPreferenceStorageSpy).toBeCalledTimes(2);

    await waitFor(() => {
      expect(setPreferenceStorageSpy).toBeCalledWith(
        PreferencesKeys.APP_BIOMETRY,
        {
          enabled: false,
        }
      );
    });
  });
});
