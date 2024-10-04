import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import { Onboarding } from "./index";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SetPasscode } from "../SetPasscode";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../globals/types";
import { CreatePassword } from "../CreatePassword";

const exitApp = jest.fn();
jest.mock("@capacitor/app", () => ({
  ...jest.requireActual("@capacitor/app"),
  App: {
    exitApp: () => exitApp(),
    addListener: jest.fn(() =>
      Promise.resolve({
        remove: jest.fn(),
      })
    ),
  },
}));

jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => true,
    },
  };
});

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={store}>
          <Onboarding />
        </Provider>
      </MemoryRouter>
    );
    const slide1 = getByText(EN_TRANSLATIONS.onboarding.slides[0].title);
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={store}>
          <Onboarding />
        </Provider>
      </MemoryRouter>
    );
    const button = getByText(
      EN_TRANSLATIONS.onboarding.getstarted.button.label
    );
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={store}>
          <Onboarding />
        </Provider>
      </MemoryRouter>
    );
    const alreadyWallet = getByText(
      EN_TRANSLATIONS.onboarding.alreadywallet.button.label
    );
    expect(alreadyWallet).toBeInTheDocument();
  });

  test("If the user hasn't set a passcode yet, they will be asked to create one", async () => {
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={store}>
          <Onboarding />
          <SetPasscode />
        </Provider>
      </MemoryRouter>
    );

    const buttonContinue = getByText(
      EN_TRANSLATIONS.onboarding.getstarted.button.label
    );

    fireEvent.click(buttonContinue);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
      ).toBeVisible()
    );
  });

  test("If the user has already set a passcode but they haven't created a password, they will be asked to create one", async () => {
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        routes: [{ path: RoutePath.ONBOARDING }],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.IDLE,
      },
      seedPhraseCache: {
        seedPhrase: "",
        brand: "",
      },
    };
    const storeMocked = mockStore(initialState);

    const { getByText, queryAllByText } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={storeMocked}>
          <Route
            path={RoutePath.ONBOARDING}
            component={Onboarding}
          />
          <Route
            path={RoutePath.CREATE_PASSWORD}
            component={CreatePassword}
          />
        </Provider>
      </MemoryRouter>
    );

    const buttonContinue = getByText(
      EN_TRANSLATIONS.onboarding.getstarted.button.label
    );

    fireEvent.click(buttonContinue);

    await waitFor(() => {
      expect(queryAllByText(EN_TRANSLATIONS.createpassword.title)).toHaveLength(
        2
      );
    });
  });

  test("Exit app with double tap", async () => {
    render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={store}>
          <Onboarding />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent(
        document,
        new CustomEvent("ionBackButton", {
          detail: {
            register: (priority: string, handler: () => void) => {
              handler();
            },
          },
        })
      );
      fireEvent(
        document,
        new CustomEvent("ionBackButton", {
          detail: {
            register: (priority: string, handler: () => void) => {
              handler();
            },
          },
        })
      );
    });

    await waitFor(() => {
      expect(exitApp).toBeCalled();
    });
  });
});
