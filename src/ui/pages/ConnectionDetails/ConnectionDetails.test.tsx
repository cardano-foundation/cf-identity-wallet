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

    expect(getByText(connectionsFix[0].issuer)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[0].issuer));
    });

    await waitFor(() =>
      expect(queryByTestId("connection-details-page")).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(getByText(connectionsFix[1].issuer)).toBeVisible();
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
      fireEvent.click(getByText(connectionsFix[0].issuer));
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    waitForIonicReact();

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.connections.details.options.title)
      ).toBeVisible()
    );

    const backdrop = document.querySelector("ion-backdrop");

    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  test.skip("Remove connection using red button ConnectionOptions", async () => {
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
      fireEvent.click(getByText(connectionsFix[0].issuer));
    });

    act(() => {
      fireEvent.click(getByTestId("connection-details-delete-button"));
    });

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.connections.details.options.alert.title)
      ).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("alert-confirm"));
    });

    await waitFor(() =>
      expect(getByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible()
    );
  });

  test.skip("Remove connection opening ConnectionOptions modal", async () => {
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
      fireEvent.click(getByText(connectionsFix[0].issuer));
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.connections.details.options.title)
      ).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("connection-options-delete-button"));
    });

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.connections.details.options.alert.title)
      ).toBeVisible()
    );
  });
});
