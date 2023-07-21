import { act, render, waitFor } from "@testing-library/react";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { ChooseAccountName } from "./ChooseAccountName";
import { TabsRoutePath } from "../../../routes/paths";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Choose Crypto Account name", () => {
  test("Render the modal", async () => {
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
    const setDefaultAccountData = jest.fn();
    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <ChooseAccountName
          chooseAccountNameIsOpen={true}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          setDefaultAccountData={setDefaultAccountData}
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
    const handleCreateWallet = jest.fn();
    const setDefaultAccountData = jest.fn();

    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <ChooseAccountName
          chooseAccountNameIsOpen={true}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          setDefaultAccountData={setDefaultAccountData}
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

    await waitFor(() => {
      expect(handleCreateWallet).toHaveBeenCalledWith("skip");
    });
  });
});
