import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { didFix, identityFix } from "../../__fixtures__/identityFix";
import { DidCardDetails } from "./DidCardDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import {
  filteredDidFix,
  filteredKeriFix,
} from "../../__fixtures__/filteredIdentityFix";

const path = TabsRoutePath.DIDS + "/" + identityFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identityFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      getIdentity: jest
        .fn()
        .mockResolvedValue({ type: "key", result: identityFix[0] }),
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialStateDidKey = {
  stateCache: {
    routes: [TabsRoutePath.DIDS],
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
  identitiesCache: {
    identities: filteredDidFix,
  },
};
const initialStateKeri = {
  stateCache: {
    routes: [TabsRoutePath.DIDS],
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
  identitiesCache: {
    identities: filteredKeriFix,
  },
};

const storeMockedDidKey = {
  ...mockStore(initialStateDidKey),
  dispatch: dispatchMock,
};

const storeMockedKeri = {
  ...mockStore(initialStateKeri),
  dispatch: dispatchMock,
};

describe("Cards Details page", () => {
  test("It opens the sharing modal", async () => {
    const { getByTestId } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
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

    expect(getByTestId("share-identity-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It opens the edit modal", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identity-options-button"));
    });

    expect(getByTestId("identity-options-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It shows the button to access the editor", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identity-options-button"));
    });

    await waitFor(() => {
      expect(
        getByTestId("identity-options-identity-options-button")
      ).toBeInTheDocument();
    });
  });

  test.skip("It shows the editor", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identity-options-button"));
    });

    await waitFor(() => {
      expect(
        getByTestId("identity-options-identity-options-button")
      ).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("identity-options-identity-options-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.identityoptions.inner.label)
      ).toBeVisible();
    });
  });

  test("It asks to verify the password when users try to delete the did using the button in the modal", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("identity-options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("identity-options-delete-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getAllByText(EN_TRANSLATIONS.identityoptions.delete)[0]);
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.dids.card.details.delete.alert.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.dids.card.details.delete.alert.confirm)
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });

  test("It shows the warning when I click on the big delete button", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("card-details-delete-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.dids.card.details.delete.alert.title)
      ).toBeVisible();
    });
  });

  test.skip("It deletes the did using the big button", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={storeMockedDidKey}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredDidFix[0].id)).toBeInTheDocument()
    );
    act(() => {
      fireEvent.click(getByTestId("card-details-delete-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.dids.card.details.delete.alert.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.dids.card.details.delete.alert.confirm)
      );
    });
    await waitForIonicReact();

    await waitFor(() => {
      expect(queryByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
    });
  });
});
