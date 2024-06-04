import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { SidePage } from "./SidePage";
import { TabsRoutePath } from "../../../routes/paths";
import { walletConnectionsFix } from "../../__fixtures__/walletConnectionsFix";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { setPauseQueueIncomingRequest } from "../../../store/reducers/stateCache";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { NotificationRoute } from "../../../core/agent/agent.types";

describe("Side Page: wallet connect", () => {
  const initialStateFull = {
    stateCache: {
      routes: [TabsRoutePath.CREDENTIALS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
      queueIncomingRequest: {
        isProcessing: false,
        queues: [],
        isPaused: false,
      },
    },
    identifiersCache: {
      identifiers: [...identifierFix],
    },
    walletConnectionsCache: {
      pendingDAppMeerKat: "pending-meerkat",
    },
  };

  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const mockedStore = {
    ...mockStore(initialStateFull),
    dispatch: dispatchMock,
  };

  test("Render wallet connect", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <SidePage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.title
        )
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setPauseQueueIncomingRequest(true));
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button-connect-wallet-stage-one"));
    });

    await waitFor(() => {
      expect(getByTestId("alert-decline-connect-confirm-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("alert-decline-connect-confirm-button"));
      fireEvent.transitionEnd(getByTestId("side-slider"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setPauseQueueIncomingRequest(false));
    });
  });
});

describe("Side Page: incoming request", () => {
  const initialStateFull = {
    stateCache: {
      routes: [TabsRoutePath.CREDENTIALS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
      queueIncomingRequest: {
        isProcessing: true,
        queues: [
          {
            id: "11111",
            type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
            label: "Cardano",
            event: {
              id: "id",
              a: {
                r: NotificationRoute.ExnIpexGrant,
              },
              createdAt: new Date(),
            },
          },
        ],
        isPaused: false,
      },
    },
    identifiersCache: {
      identifiers: [...identifierFix],
    },
    walletConnectionsCache: {},
  };

  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const mockedStore = {
    ...mockStore(initialStateFull),
    dispatch: dispatchMock,
  };

  test("Render incomming request", async () => {
    const { getByText } = render(
      <Provider store={mockedStore}>
        <SidePage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.request.credential.title)
      ).toBeInTheDocument();
    });
  });
});
