import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { act } from "react-dom/test-utils";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { ChooseCredential } from "./ChooseCredential";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { setNotificationDetailCache } from "../../../../../store/reducers/notificationsCache";
import { KeriaNotification } from "../../../../../core/agent/agent.types";
import { ACDC } from "./CredentialRequest.types";

const credRequest = {
  schema: {
    name: "IIW 2024 Demo Day Attendee",
    description:
      "This Trust Over IP (ToIP) Authentic Chained Data Container (ACDC) Credential provides an end-verifiable attestation that the holder attended the Internet Identity Workshop (IIW) on April 16 - 18, 2024, and participated in the Cardano Foundation's Mobile Key Event Receipt Infrastructure (KERI) Wallet demonstration.",
  },
  credentials: [
    {
      connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
      acdc: {
        v: "ACDC10JSON000191_",
        d: "ENj6MvfV1AdbBtkI-0BTLcTMPYtl1PDu1AXVHN4hMzVa",
        i: "EKtDv2h7MNqyhI5iODKtjEQAYWG-tjV5mDzEMf6MW6V0",
        ri: "EANnrMjnnwmII_zt11VA3Y2O4hLqdXRxS1PI18zopFVT",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "EBZ0TjCqQtxgkcxi_vKE0ppkULOOo_r9KYxTew0RVqLe",
          i: "EG8kbz8r7wI5-zZEF6cq459KNEIIWZR4EyMofehCaUqF",
          dt: "2024-07-16T03:32:59.312000+00:00",
          attendeeName: "hmlax",
        },
      },
    },
    {
      connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
      acdc: {
        v: "ACDC10JSON000191_",
        d: "EOT8OgwrwwNnBc-FzHPUBzsFQHOGXfifKqzfT5HwOVyb",
        i: "EKtDv2h7MNqyhI5iODKtjEQAYWG-tjV5mDzEMf6MW6V0",
        ri: "EANnrMjnnwmII_zt11VA3Y2O4hLqdXRxS1PI18zopFVT",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELzvJfDiAyqR8lf466l25AwY7uq_VUN1aBriBIKN7aFM",
          i: "EC_FburiEJzhcSid-XljVAVt1yuWOtALQtmnauaBNFiP",
          dt: "2024-07-16T03:32:51.604000+00:00",
          attendeeName: "hmlax",
        },
      },
    },
  ],
  attributes: {
    attendeeName: "hmlax",
  },
};

mockIonicReact();

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const offerAcdcFromApplyMock = jest.fn(
  (detail: KeriaNotification, acdc: ACDC) =>
    Promise.resolve({
      detail,
      acdc,
    })
);

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      ipexCommunications: {
        offerAcdcFromApply: (detail: KeriaNotification, acdc: ACDC) =>
          offerAcdcFromApplyMock(detail, acdc),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialState = {
  stateCache: {
    routes: [TabsRoutePath.NOTIFICATIONS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
};

describe("Credential request - choose request", () => {
  test("Render", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId, getAllByText } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    expect(
      getByTestId("card-item-" + credRequest.credentials[0].acdc.d)
    ).toBeVisible();
    expect(
      getByTestId("card-item-" + credRequest.credentials[1].acdc.d)
    ).toBeVisible();

    expect(getAllByText(connectionsForNotifications[0].label).length).toBe(2);

    expect(
      getByText(
        `${formatShortDate(
          credRequest.credentials[0].acdc.a.dt
        )} - ${formatTimeToSec(credRequest.credentials[0].acdc.a.dt)}`
      )
    ).toBeVisible();
    expect(
      getByText(
        `${formatShortDate(
          credRequest.credentials[1].acdc.a.dt
        )} - ${formatTimeToSec(credRequest.credentials[1].acdc.a.dt)}`
      )
    ).toBeVisible();
  });

  test("Show detail", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-detail-${credRequest.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setNotificationDetailCache({
          notificationId: notificationsFix[4].id,
          viewCred: credRequest.credentials[0].acdc.d,
          step: 1,
          checked: false,
        })
      );
    });
  });

  test("Update cred after nav from cred detail page - check new", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: {
          notificationId: notificationsFix[4].id,
          viewCred: credRequest.credentials[0].acdc.d,
          step: 1,
          checked: true,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequest.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
      expect(dispatchMock).toBeCalledWith(setNotificationDetailCache(null));
    });
  });

  test("Update cred after nav from cred detail page - uncheck", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId, rerender } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-select-${credRequest.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequest.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
    });

    const updateState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: {
          notificationId: notificationsFix[4].id,
          viewCred: credRequest.credentials[0].acdc.d,
          step: 1,
          checked: false,
        },
      },
    };

    const newStore = {
      ...mockStore(updateState),
      dispatch: dispatchMock,
    };

    rerender(
      <Provider store={newStore}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequest.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(false);
      expect(dispatchMock).toBeCalledWith(setNotificationDetailCache(null));
    });
  });

  test("Submit", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequest}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-select-${credRequest.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequest.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(getByTestId("cre-request-spinner-container")).toBeVisible();
    });

    expect(offerAcdcFromApplyMock).toBeCalledWith(
      notificationsFix[4],
      credRequest.credentials[0].acdc
    );
  });
});
