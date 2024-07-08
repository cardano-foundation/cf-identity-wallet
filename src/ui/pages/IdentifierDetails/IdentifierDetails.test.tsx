import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { IdentifierDetails } from "./IdentifierDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { Agent } from "../../../core/agent/agent";
import { ConfigurationService } from "../../../core/configuration";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

const path = TabsRoutePath.IDENTIFIERS + "/" + identifierFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identifierFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

const getMock = jest.fn((key: string) => "111111");

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => getMock(key),
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) => (
    <div
      style={{ display: isOpen ? undefined : "none" }}
      data-testid={props["data-testid"]}
    >
      {isOpen ? children : null}
    </div>
  ),
}));

const rotateIdentifierMock = jest.fn((id: string) => Promise.resolve());

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue(identifierFix[0]),
        rotateIdentifier: (id: string) => rotateIdentifierMock(id),
      },
      connections: {
        getOobi: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: jest.fn().mockResolvedValue(undefined),
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
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
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
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMockedAidKeri}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("share-button")).toBeInTheDocument();
      expect(queryByTestId("identifier-card-detail-spinner-container")).toBe(
        null
      );
    });

    expect(queryByTestId("share-identifier-modal")).not.toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("share-button"));
    });

    await waitFor(() => {
      expect(getByTestId("share-identifier-modal")).toBeVisible();
    });
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

    expect(getByTestId("identifier-options-modal")).not.toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-options-button"));
    });

    expect(getByTestId("identifier-options-modal")).toBeVisible();
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
        getAllByText(EN_TRANSLATIONS.identifiers.details.delete.alert.title)[0]
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
    Agent.agent.basicStorage.save = jest
      .fn()
      .mockImplementation(async (data: BasicRecord): Promise<void> => {
        expect(data.id).toBe(MiscRecordId.IDENTIFIERS_FAVOURITES);
        expect(data.content).toBe(filteredIdentifierFix[0]);
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

    const { getByTestId, unmount } = render(
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

    await act(async () => getMock.mockImplementation(() => "111111"));
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

  test("Rotate key", async () => {
    const initialStateKeri = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
      },
      seedPhraseCache: {
        seedPhrase: "",
        bran: "bran",
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

    const { queryByTestId, getByTestId, getByText } = render(
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

    act(() => {
      fireEvent.click(getByTestId("signing-key-0-action-icon"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.identifiers.details.rotatekeys.description)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("rotate-key-button"));
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-0")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-1")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-2")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-3")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-4")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-5")).toBeVisible();
    });

    await waitFor(() => {
      expect(rotateIdentifierMock).toBeCalledWith(identifierFix[0].id);
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.ROTATE_KEY_SUCCESS)
      );
    });
  });
});
