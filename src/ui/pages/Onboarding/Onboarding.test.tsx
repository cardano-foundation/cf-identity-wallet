import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Onboarding } from "./index";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { SetPasscode } from "../SetPasscode";
import { store } from "../../../store";
import { RoutePaths } from "../../../routes";

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Onboarding />
      </Provider>
    );
    const slide1 = getByText(EN_TRANSLATIONS["onboarding.slides"][0].title);
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Onboarding />
      </Provider>
    );
    const button = getByText(
      EN_TRANSLATIONS["onboarding.getstarted.button.label"]
    );
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Onboarding />
      </Provider>
    );
    const alreadyWallet = getByText(
      EN_TRANSLATIONS["onboarding.alreadywallet.button.label"]
    );
    expect(alreadyWallet).toBeInTheDocument();
  });

  test("If the user hasn't set a passcode yet, they will be asked to create one", async () => {
    const { getByTestId, queryByText } = render(
      <MemoryRouter initialEntries={[RoutePaths.ONBOARDING_ROUTE]}>
        <Provider store={store}>
          <Route
            path={RoutePaths.ONBOARDING_ROUTE}
            component={Onboarding}
          />

          <Route
            path={RoutePaths.SET_PASSCODE_ROUTE}
            component={SetPasscode}
          />
        </Provider>
      </MemoryRouter>
    );

    const buttonContinue = getByTestId("get-started-button");

    fireEvent.click(buttonContinue);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS["setpasscode.enterpasscode.title"])
      ).toBeVisible()
    );
  });

  test("If the user has already set a passcode but they haven't created a profile, they will be asked to generate a seed phrase", async () => {
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
    };
    const storeMocked = mockStore(initialState);

    const { getByTestId, queryByText } = render(
      <MemoryRouter initialEntries={[RoutePaths.ONBOARDING_ROUTE]}>
        <Provider store={storeMocked}>
          <Route
            path={RoutePaths.ONBOARDING_ROUTE}
            component={Onboarding}
          />
          <Route
            path={RoutePaths.GENERATE_SEED_PHRASE_ROUTE}
            component={GenerateSeedPhrase}
          />
        </Provider>
      </MemoryRouter>
    );

    const buttonContinue = getByTestId("get-started-button");

    fireEvent.click(buttonContinue);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS["generateseedphrase.title"])
      ).toBeVisible()
    );
  });
});
