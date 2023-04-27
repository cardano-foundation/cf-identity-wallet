import { MemoryRouter, Route } from "react-router-dom";
import { fireEvent, render } from "@testing-library/react";
import { PasscodeLogin } from "./PasscodeLogin";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Passcode Login Page", () => {
  const storedPasscode =
    "$argon2id$v=19$m=19456,t=2,p=1$9rNY0Jq12CTkSsZNkWp8Jg$CXvjykDaCagRyUc9TrA/N45iTHb3SlGcXICpw2Rrzp0";
  test("Renders Passcode Login page with title and description", () => {
    const { getByText } = render(
      <PasscodeLogin storedPasscode={storedPasscode} />
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
      <PasscodeLogin storedPasscode={storedPasscode} />
    );
    fireEvent.click(getByText(/1/));
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).toContain("circle-fill");
    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    expect(circleElement.classList).not.toContain("circle-fill");
  });

  test("Renders Generate Seed Phrase page when passcode is entered correctly", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/passcodelogin"]}>
        <Route
          path="/passcodelogin"
          render={(props) => (
            <PasscodeLogin
              {...props}
              storedPasscode={storedPasscode}
            />
          )}
        />
        <Route
          path="/generateseedphrase"
          component={GenerateSeedPhrase}
        />
      </MemoryRouter>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    expect(
      getByText(EN_TRANSLATIONS["generateseedphrase.title"])
    ).toBeInTheDocument();
  });
});
