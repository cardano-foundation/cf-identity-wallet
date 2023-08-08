import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Creds } from "./Creds";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsMock } from "../../__mocks__/filteredCredsMock";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connections } from "../../__fixtures__/connections";
import { formatShortDate } from "../../../utils";

describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

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
      creds: filteredCredsMock,
    },
    connectionsCache: {
      connections: connections,
    },
  };

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

    expect(getByTestId("creds-cards-placeholder")).toBeInTheDocument();
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

    expect(getByTestId("cred-card-stack-index-0")).toBeInTheDocument();
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
      fireEvent.click(getByTestId("back-button-connections"));
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
      expect(getByTestId("connections-cards-placeholder")).toBeInTheDocument();
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

    expect(getByText(connections[0].issuer)).toBeVisible();
    expect(
      getByText(formatShortDate(`${connections[0].issuanceDate}`))
    ).toBeVisible();
    expect(getByText(connections[0].status)).toBeVisible();
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
