import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { waitForIonicReact } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { Creds } from "../Creds";
import { ConnectionDetails } from "./ConnectionDetails";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      connections: {
        getConnectionById: jest.fn().mockResolvedValue({
          id: "ebfeb1ebc6f1c276ef71212ec20",
          label: "Cambridge University",
          connectionDate: "2017-08-14T19:23:24Z",
          logo: ".png",
          status: "pending",
        }),
      },
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      genericRecords: {
        findById: jest.fn(),
      },
    },
  },
}));
jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
  },
}));

describe("ConnectionDetails Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
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
    },
    connectionsCache: {
      connections: connectionsFix,
    },
  };

  test("Open and close ConnectionDetails", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[0].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].label));
    });

    await waitFor(() =>
      expect(queryByTestId("connection-details")).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(getByText(connectionsFix[1].label)).toBeVisible();
    });
  });

  test("Open and Close ConnectionOptions", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].label));
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() =>
      expect(getByTestId("delete-button-connection-details")).toBeVisible()
    );
  });

  test("Delete button in the footer triggers a confirmation alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, findByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].label));
    });

    const alertDeleteConnection = await findByTestId(
      "alert-confirm-delete-connection"
    );
    expect(alertDeleteConnection).toHaveClass("alert-invisible");
    const deleteButton = await findByTestId("delete-button-connection-details");
    act(() => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() =>
      expect(alertDeleteConnection).toHaveClass("alert-visible")
    );
  });

  test.skip("Delete button in the ConnectionOptions modal triggers a confirmation alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, findByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].label));
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    const alertDeleteConnection = await findByTestId(
      "alert-confirm-delete-connection"
    );
    expect(alertDeleteConnection).toHaveClass("alert-invisible");
    const deleteButton = await findByTestId("delete-button-connection-options");
    act(() => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() =>
      expect(alertDeleteConnection).toHaveClass("alert-visible")
    );
  });

  test.skip("Open Manage Connection notes modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].label));
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() =>
      expect(getByTestId("connection-options-manage-button")).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("connection-options-manage-button"));
    });

    await waitForIonicReact();

    await waitFor(() =>
      expect(getByTestId("edit-connections-modal")).toHaveAttribute(
        "is-open",
        "true"
      )
    );
  });
});
