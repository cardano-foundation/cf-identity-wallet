import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { SetOptions } from "@capacitor/preferences";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { IdentifierDetails } from "./IdentifierDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";
import { Agent } from "../../../core/agent/agent";
import { ConfigurationService } from "../../../core/configuration";

const path = TabsRoutePath.IDENTIFIERS + "/" + identifierFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identifierFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue(identifierFix[0]),
      },
      connections: {
        getKeriOobi: jest.fn(),
      },
      genericRecords: {
        findById: jest.fn(),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialStateKeri = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
    },
  },
  seedPhraseCache: {
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
    favourites: [],
  },
};

const storeMockedAidKeri = {
  ...mockStore(initialStateKeri),
  dispatch: dispatchMock,
};

describe("Cards Details page", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });
  test("It opens the sharing modal", async () => {
    const { getByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByTestId("share-button")).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("share-button"));
    });

    expect(getByTestId("share-identifier-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It opens the edit modal", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identifier-options-button"));
    });

    expect(
      getByTestId("identifier-options-modal").getAttribute("is-open")
    ).toBe("true");
  });

  test("It shows the button to access the editor", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identifier-options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identifier-options")).toBeInTheDocument();
    });
  });

  test.skip("It shows the editor", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identifier-options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identifier-options")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("edit-identifier-options"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.identifiers.details.options.inner.label)
      ).toBeVisible();
    });
  });

  test("It asks to verify the password when users try to delete the identifier using the button in the modal", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identifier-options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("delete-identifier-options")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(
        getAllByText(EN_TRANSLATIONS.identifiers.details.options.delete)[0]
      );
    });

    await waitFor(() => {
      expect(
        getAllByText(EN_TRANSLATIONS.identifiers.details.delete.alert.title)[1]
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getAllByText(
          EN_TRANSLATIONS.identifiers.details.delete.alert.confirm
        )[0]
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });

  test("It shows the warning when I click on the big delete button", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("delete-button-identifier-card-details"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.identifiers.details.delete.alert.title)
      ).toBeVisible();
    });
  });

  test.skip("It changes to favourite icon on click disabled favourite button", async () => {
    PreferencesStorage.set = jest
      .fn()
      .mockImplementation(async (data: SetOptions): Promise<void> => {
        expect(data.key).toBe(PreferencesKeys.APP_IDENTIFIERS_FAVOURITES);
        expect(data.value).toBe(filteredIdentifierFix[0]);
      });

    const { getByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("heart-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getByTestId("heart-icon-favourite")).toBeVisible();
    });
  });

  test.skip("It deletes the identifier using the big button", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("delete-button-identifier-card-details"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.identifiers.details.delete.alert.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.identifiers.details.delete.alert.confirm)
      );
    });
    await waitForIonicReact();

    await waitFor(() => {
      expect(queryByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });

  test("Show loading when indetifier data is null", async () => {
    Agent.agent.identifiers.getIdentifiers = jest.fn().mockResolvedValue(null);

    const { getByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByTestId("identifier-card-detail-spinner-container")
      ).toBeVisible()
    );
  });

  test("Hide loading after retrieved indetifier data", async () => {
    const { queryByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(queryByTestId("identifier-card-detail-spinner-container")).toBe(
        null
      )
    );
  });
});
