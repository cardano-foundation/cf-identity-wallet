import {MemoryRouter, Route, useHistory} from "react-router-dom";
import { fireEvent, render } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { PasscodeLogin } from "./PasscodeLogin";
import { Onboarding } from "../Onboarding";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  GENERATE_SEED_PHRASE_ROUTE,
  ONBOARDING_ROUTE,
  PASSCODE_LOGIN_ROUTE,
  SET_PASSCODE_ROUTE,
} from "../../../routes";
import { SetPasscode } from "../SetPasscode";
import { store } from "../../../store";
import { Provider } from "react-redux";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { setAuthentication } from "../../../store/reducers/StateCache";
import {useAppDispatch} from "../../../store/hooks";

describe("Passcode Login Page", () => {
  const storedPasscode =
    "$argon2id$v=19$m=19456,t=2,p=1$9rNY0Jq12CTkSsZNkWp8Jg$CXvjykDaCagRyUc9TrA/N45iTHb3SlGcXICpw2Rrzp0";
  test("Renders Passcode Login page with title and description", () => {
    const { getByText } = render(
      <Provider store={store}>
        <PasscodeLogin />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS["passcodelogin.title"])
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS["passcodelogin.description"])
    ).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <PasscodeLogin />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).toContain("circle-fill");
    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    expect(circleElement.classList).not.toContain("circle-fill");
  });

  test("If no seed phrase was stored and I click on I forgot my passcode, I can start over", async () => {
    const { getByText, findByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[PASSCODE_LOGIN_ROUTE]}>
          <Route
            path={PASSCODE_LOGIN_ROUTE}
            render={(props) => <PasscodeLogin />}
          />
          <Route
            path={SET_PASSCODE_ROUTE}
            component={SetPasscode}
          />
        </MemoryRouter>
      </Provider>
    );
    // User gets the passcode wrong
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));

    // User clicks on "I've forgotten my passcode"
    fireEvent.click(
      getByText(EN_TRANSLATIONS["passcodelogin.forgotten.button"])
    );
    // User sees the pop up
    expect(
      await findByText(EN_TRANSLATIONS["passcodelogin.alert.text.restart"])
    ).toBeVisible();
    // User can choose to start again
    fireEvent.click(
      getByText(EN_TRANSLATIONS["passcodelogin.alert.button.restart"])
    );
    expect(
      await findByText(EN_TRANSLATIONS["setpasscode.enterpasscode.title"])
    ).toBeVisible();
  });

  // TODO: There is not passcode set yet, we dont know what is the next page bc this is dynamic.
});


describe("PasscodeLogin", () => {

  /*
  jest.mock("./PasscodeLogin", () => ({
    ...jest.requireActual("./PasscodeLogin"),
    verifyPasscode: jest.fn(() => true),
  }));*/

  test("should log in user on correct passcode and redirect to generate seed phrase page", async () => {

    const { getByText, findByText } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[PASSCODE_LOGIN_ROUTE, GENERATE_SEED_PHRASE_ROUTE]}>
            <Route
                path={PASSCODE_LOGIN_ROUTE}
                component={PasscodeLogin}
            />
            <Route
                path={GENERATE_SEED_PHRASE_ROUTE}
                component={GenerateSeedPhrase}
            />
          </MemoryRouter>
        </Provider>
    );

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));


    expect(
        await findByText(EN_TRANSLATIONS["generateseedphrase.title"])
    ).toBeVisible();


  });
});

