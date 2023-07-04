import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { didsMock } from "../../__mocks__/didsMock";
import { DidCardDetails } from "./DidCardDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { filteredDidsMock } from "../../__mocks__/filteredDidsMock";

const path = TabsRoutePath.DIDS + "/" + didsMock[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: didsMock[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/aries/ariesAgent.ts", () => ({
  AriesAgent: {
    agent: {
      getIdentity: jest.fn().mockResolvedValue(didsMock[0]),
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.DIDS],
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
  identitiesCache: {
    identities: filteredDidsMock,
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

const storeMocked2 = {
  ...mockStore({ ...initialState }),
  dispatch: jest.fn(),
};

describe("Cards Details page", () => {
  test("It renders Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    expect(getByTestId("share-identity-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getByTestId("edit-identity-modal").getAttribute("is-open")).toBe(
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
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked2}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    fireEvent.click(getByTestId("copy-button-id"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({ string: didsMock[0].id });
    });
  });

  test("It copies type to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    fireEvent.click(getByTestId("copy-button-type"));
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].keyType,
      });
    });
  });

  test("It copies controller to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    fireEvent.click(getByTestId("copy-button-controller"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].controller,
      });
    });
  });

  test("It copies publicKeyBase58 to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    fireEvent.click(getByTestId("copy-button-publicKeyBase58"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].publicKeyBase58,
      });
    });
  });

  test("It opens the sharing modal", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
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
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    expect(getByTestId("edit-identity-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It shows the button to access the editor", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identity-edit-button")).toBeInTheDocument();
    });
  });

  test.skip("It shows the editor", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identity-edit-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("edit-identity-edit-button"));
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.editidentity.inner.label)).toBeVisible();
    });
  });

  test("It asks to verify the password when users try to delete the did using the button in the modal", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identity-delete-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getAllByText(EN_TRANSLATIONS.editidentity.delete)[0]);
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
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
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
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didsMock[0].id)).toBeInTheDocument());
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
