import { AnyAction, Store } from "@reduxjs/toolkit";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { formatShortDate } from "../../utils/formatters";
import { Creds } from "./Credentials";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
    },
  },
}));
const initialStateEmpty = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
    isOnline: true,
  },
  seedPhraseCache: {},
  credsCache: {
    creds: [],
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: [],
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: filteredCredsFix,
    favourites: [
      {
        id: filteredCredsFix[0].id,
        time: 1,
      },
    ],
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

let mockedStore: Store<unknown, AnyAction>;
describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
  });

  test("Renders favourites in Creds", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={mockedStore}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(EN_TRANSLATIONS.credentials.tab.favourites)
    ).toBeInTheDocument();
  });

  test("Renders Creds Tab", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("credentials-tab")).toBeInTheDocument();
    expect(getByText("Credentials")).toBeInTheDocument();
  });

  test("Renders Creds Card placeholder", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByTestId("credentials-tab-cards-placeholder")
    ).toBeInTheDocument();
  });

  test("Renders Creds Card", () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("keri-card-template-favs-index-0")).toBeInTheDocument();
  });

  test("Toggle Connections view", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId("connections-tab")).toHaveClass("hide");
    });

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(getByTestId("connections-tab")).toHaveClass("show");
    });

    act(() => {
      fireEvent.click(getByTestId("tab-back-button"));
    });

    await waitFor(() => {
      expect(getByTestId("connections-tab")).toHaveClass("hide");
    });
  });

  test("Show Connections placeholder", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(
        getByTestId("connections-tab-cards-placeholder")
      ).toBeInTheDocument();
    });
  });

  test("Show Connections list", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText, getAllByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connections-cards-placeholder")).toBeNull();
    });

    expect(getByText(connectionsFix[0].label)).toBeVisible();
    expect(
      getByText(formatShortDate(`${connectionsFix[0].connectionDate}`))
    ).toBeVisible();
    expect(getAllByText(connectionsFix[0].status)[0]).toBeVisible();
  });

  test.skip("Show Add Connections modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Creds />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("add-connection-modal")).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });
});
