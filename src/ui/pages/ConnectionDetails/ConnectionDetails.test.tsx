import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { CredCardDetails } from "./ConnectionDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { credsFix } from "../../__fixtures__/credsFix";

const path = TabsRoutePath.CREDS + "/" + credsFix[0].id;

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Cards Details page", () => {
  test("It renders Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText(credsFix[0].credentialType)).toBeInTheDocument();
    expect(getByTestId("creds-options-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );
  });

  test("It copies id to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByTestId("copy-button-proof-value"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: credsFix[0].proofValue,
      });
    });
  });

  test("It opens the options modal", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId("creds-options-modal").getAttribute("is-open")).toBe(
      "false"
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    expect(getByTestId("creds-options-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test.skip("It shows the credential viewer", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-view-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-view-button"));
    });

    await waitFor(() => {
      expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
        "true"
      );
    });

    await waitFor(() => {
      expect(getByText(credsFix[0].id)).toBeVisible();
    });
  });

  test.skip("It asks to verify the password when users try to delete the cred using the button in the modal", async () => {
    const { getByTestId, getByText, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-delete-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-delete-button"));
    });

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
        "true"
      );
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.creds.card.details.delete.alert.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.creds.card.details.delete.alert.confirm)
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });

  test("It shows the warning when I click on the big delete button", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("card-details-delete-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.creds.card.details.delete.alert.title)
      ).toBeVisible();
    });
  });

  test.skip("It deletes the cred using the big button", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("card-details-delete-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.creds.card.details.delete.alert.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.creds.card.details.delete.alert.confirm)
      );
    });
    await waitForIonicReact();

    await waitFor(() => {
      expect(queryByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });
});
