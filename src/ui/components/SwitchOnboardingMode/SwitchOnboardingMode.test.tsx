import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SwitchOnboardingMode } from "./SwitchOnboardingMode";
import { OnboardingMode } from "./SwitchOnboardingMode.types";

const deleteById = jest.fn();
const createNew = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        deleteById: () => deleteById(),
        createOrUpdateBasicRecord: () => createNew(),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: ["/"],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {
    seedPhrase: "",
    bran: "",
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: unknown }) => children,
  IonCheckbox: (props: any) => {
    return <input type="checkbox" data-testid={props["data-testid"]} checked={props.checked} onChange={(event) => {
      props.onIonChange({
        detail: {
          checked: event.target.checked
        }
      })
    }}/>
  }
}));

jest.mock("../../hooks", () => ({
  ...jest.requireActual("../../hooks"),
  useAppIonRouter: () => ({
    push: jest.fn()
  })
}))

describe("Switch onboarding mode", () => {
  test("Render create mode", async () => {
    require("@ionic/react");
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <SwitchOnboardingMode mode={OnboardingMode.Create} />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.verifyrecoveryseedphrase.button.switch)
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.verifyrecoveryseedphrase.button.switch)
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.switchmodemodal.title)).toBeVisible();
    });

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.create.paragraphtop)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.create.paragraphbot)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.button.continue)
    ).toBeVisible();

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.switchmodemodal.button.continue).getAttribute(
          "disabled"
        )
      ).toBe("")
    })

    fireEvent.click(getByTestId("confirm-checkbox"));

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.switchmodemodal.button.continue).getAttribute(
          "disabled"
        )
      ).toBe("false")
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-switch-modal"));
    });

    await waitFor(() => {
      expect(deleteById).toBeCalled();
    });
  });

  test("Render recovery mode", async () => {
    require("@ionic/react");
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <SwitchOnboardingMode mode={OnboardingMode.Recovery} />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.generateseedphrase.onboarding.button.switch)
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.generateseedphrase.onboarding.button.switch)
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.switchmodemodal.title)).toBeVisible();
    });

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.recovery.paragraphtop)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.recovery.paragraphbot)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.switchmodemodal.button.continue)
    ).toBeVisible();

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.switchmodemodal.button.continue).getAttribute(
          "disabled"
        )
      ).toBe("")
    })

    fireEvent.click(getByTestId("confirm-checkbox"));

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.switchmodemodal.button.continue).getAttribute(
          "disabled"
        )
      ).toBe("false")
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-switch-modal"));
    });

    await waitFor(() => {
      expect(createNew).toBeCalled();
    });
  });
});
