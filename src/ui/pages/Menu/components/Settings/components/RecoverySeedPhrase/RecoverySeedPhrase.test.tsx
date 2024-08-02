import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { RoutePath } from "../../../../../../../routes";
import { OperationType } from "../../../../../../globals/types";
import { RecoverySeedPhrase } from "./RecoverySeedPhrase";
import ENG_trans from "../../../../../../../locales/en/en.json";
import { KeyStoreKeys } from "../../../../../../../core/storage";

jest.mock("../../../../../../../core/storage", () => ({
  ...jest.requireActual("../../../../../../../core/storage"),
  SecureStorage: {
    get: jest.fn((type: KeyStoreKeys) => {
      if (type === KeyStoreKeys.APP_OP_PASSWORD)
        return Promise.resolve("Password@123");
      return Promise.resolve("111111");
    }),
  },
}));

jest.mock("../../../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        getMnemonic: jest.fn(() => Promise.resolve("")),
      },
    },
  },
}));

jest.mock("../../../../../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: jest.fn(() => ({
    biometricsIsEnabled: false,
    biometricInfo: {
      isAvailable: false,
      hasCredentials: false,
      biometryType: BiometryType.fingerprintAuthentication,
      strongBiometryIsAvailable: true,
    },
    handleBiometricAuth: jest.fn(() => Promise.resolve(false)),
    setBiometricsIsEnabled: jest.fn(),
  })),
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
}));

const initialState = {
  stateCache: {
    routes: [RoutePath.GENERATE_SEED_PHRASE],
    authentication: {
      loggedIn: false,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: false,
      seedPhraseIsSet: false,
    },
    isOnline: true,
    currentOperation: OperationType.IDLE,
  },
};

const mockStore = configureStore();
const dispatchMock = jest.fn();
const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Recovery Phrase", () => {
  test("Render", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={storeMocked}>
        <RecoverySeedPhrase />
      </Provider>
    );

    expect(
      getByText(ENG_trans.settings.sections.security.seedphrase.page.tips.one)
    ).toBeVisible();
    expect(
      getByText(ENG_trans.settings.sections.security.seedphrase.page.tips.two)
    ).toBeVisible();
    expect(
      getByText(ENG_trans.settings.sections.security.seedphrase.page.tips.three)
    ).toBeVisible();
    expect(
      getByText(
        ENG_trans.settings.sections.security.seedphrase.page.button.view
      )
    ).toBeVisible();
    expect(
      queryByText(
        ENG_trans.settings.sections.security.seedphrase.page.button.hide
      )
    ).toBe(null);
    expect(
      getByTestId("seed-phrase-module").classList.contains("seed-phrase-hidden")
    ).toBe(true);
  });

  test("Show phrase", async () => {
    const { queryByTestId, getByTestId, getByText, queryByText } = render(
      <Provider store={storeMocked}>
        <RecoverySeedPhrase />
      </Provider>
    );

    expect(
      getByText(
        ENG_trans.settings.sections.security.seedphrase.page.button.view
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByText(
          ENG_trans.settings.sections.security.seedphrase.page.button.view
        )
      );
    });

    await waitForIonicReact();

    expect(getByTestId("confirm-view-seedpharse")).toBeVisible();
    expect(getByTestId("primary-button-confirm-view-seedpharse")).toBeVisible();
    expect(
      getByTestId("primary-button-confirm-view-seedpharse").getAttribute(
        "disabled"
      )
    ).toBe("");

    act(() => {
      fireEvent.click(getByTestId("condition-item-0"));
      fireEvent.click(getByTestId("condition-item-1"));
      fireEvent.click(getByTestId("condition-item-2"));
    });

    await waitFor(() => {
      expect(
        getByTestId("primary-button-confirm-view-seedpharse").getAttribute(
          "disabled"
        )
      ).toBe("false");
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-confirm-view-seedpharse"));
    });

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() => {
      expect(queryByTestId("confirm-view-seedpharse")).toBe(null);
      expect(
        getByTestId("seed-phrase-module").classList.contains(
          "seed-phrase-visible"
        )
      ).toBe(true);
      expect(
        queryByText(
          ENG_trans.settings.sections.security.seedphrase.page.button.hide
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(
          ENG_trans.settings.sections.security.seedphrase.page.button.hide
        )
      );
    });

    await waitFor(() => {
      expect(
        getByTestId("seed-phrase-module").classList.contains(
          "seed-phrase-hidden"
        )
      ).toBe(true);
    });
  });
});

const clickButtonRepeatedly = (
  getByText: RenderResult["getByText"],
  buttonLabel: string,
  times: number
) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(getByText(buttonLabel));
  }
};
