import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Creds } from "./Creds";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { formatShortDate } from "../../utils/formatters";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
    },
  },
}));
const initialStateEmpty = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: [],
  },
  connectionsCache: {
    connections: [],
  },
};

const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
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
  connectionsCache: {
    connections: connectionsFix,
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
      <Provider store={mockedStore}>
        <Creds />
      </Provider>
    );

    expect(getByText(EN_TRANSLATIONS.creds.tab.favourites)).toBeInTheDocument();
  });

  test("Renders Creds Tab", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("creds-tab")).toBeInTheDocument();
    expect(getByText("Credentials")).toBeInTheDocument();
    expect(
      getByTestId(
        `menu-button-${EN_TRANSLATIONS.creds.tab.title.toLowerCase()}`
      )
    ).toBeInTheDocument();
  });

  test("Renders Creds Card placeholder", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("creds-tab-cards-placeholder")).toBeInTheDocument();
  });

  test("Renders Creds Card", () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("cred-card-template-favs-index-0")).toBeInTheDocument();
  });

  test("Toggle Connections view", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
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
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
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
    const { getByTestId, queryByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
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
    expect(getByText(connectionsFix[0].status)).toBeVisible();
  });

  test.skip("Show Add Connections modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
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
