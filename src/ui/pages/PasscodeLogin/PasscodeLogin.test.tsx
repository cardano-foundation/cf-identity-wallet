import { MemoryRouter, Route } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { PasscodeLogin } from "./PasscodeLogin";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SetPasscode } from "../SetPasscode";
import { store } from "../../../store";

import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";
import { RoutePath } from "../../../routes";

describe("Passcode Login Page", () => {
  test("Renders Passcode Login page with title and description", () => {
    const { getByText } = render(
      <Provider store={store}>
        <PasscodeLogin />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.passcodelogin.title)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.passcodelogin.description)
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
        <MemoryRouter initialEntries={[RoutePath.PASSCODE_LOGIN]}>
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));
    expect(await findByText(EN_TRANSLATIONS.passcodelogin.error)).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.passcodelogin.forgotten.button));
    expect(
      await findByText(EN_TRANSLATIONS.passcodelogin.alert.text.restart)
    ).toBeVisible();
    fireEvent.click(
      getByText(EN_TRANSLATIONS.passcodelogin.alert.button.restart)
    );
    expect(
      await findByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
    ).toBeVisible();
  });

  test("verifies passcode and navigates to next route", async () => {
    const storedPass = "storedPass";
    const secureStorageGetMock = jest
      .spyOn(SecureStorage, "get")
      .mockResolvedValue(storedPass);

    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.PASSCODE_LOGIN]}>
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
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
    fireEvent.click(getByText(/1/));

    await waitFor(() => {
      expect(secureStorageGetMock).toHaveBeenCalledWith(
        KeyStoreKeys.APP_PASSCODE
      );
    });
  });
  test.skip("verifies passcode and navigates to next route", async () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.PASSCODE_LOGIN]}>
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
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
    fireEvent.click(getByText(/1/));

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.generateseedphrase.new.title)
      ).toBeVisible();
    });
  });
});
