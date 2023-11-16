import { act, render, waitFor } from "@testing-library/react";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { ChooseAccountName } from "./ChooseAccountName";
import { TabsRoutePath } from "../../../routes/paths";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Choose Crypto Account name", () => {
  test.skip("Render the modal", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const setChooseAccountNameIsOpen = jest.fn();
    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <ChooseAccountName
          chooseAccountNameIsOpen={true}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          usesIdentitySeedPhrase={false}
        />
      </Provider>
    );

    expect(getByTestId("choose-account-name")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.crypto.chooseaccountnamemodal.skip)
      ).toBeVisible();
    });
  });

  test.skip("Skip the name selection", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const setChooseAccountNameIsOpen = jest.fn();

    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <ChooseAccountName
          chooseAccountNameIsOpen={true}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          usesIdentitySeedPhrase={false}
        />
      </Provider>
    );

    expect(getByTestId("choose-account-name")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.crypto.chooseaccountnamemodal.skip)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    // @TODO - foconnor: If unskipped can test Aries agent called and Redux updated
  });

  test.skip("Set a custom name", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const setChooseAccountNameIsOpen = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ChooseAccountName
          chooseAccountNameIsOpen={true}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          usesIdentitySeedPhrase={true}
        />
      </Provider>
    );

    const continueButton = getByTestId("continue-button");
    expect(continueButton).toBeDisabled();

    fireEvent.change(getByTestId("edit-display-name"), {
      target: { value: "a" },
    });

    expect(continueButton).not.toBeDisabled();
  });
});
