import { IonReactMemoryRouter } from "@ionic/react-router";
import { mockIonicReact } from "@ionic/react-test-utils";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { CredentialRequest } from "./CredentialRequest";

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

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      ipexCommunications: {
        getIpexApplyDetails: jest.fn(() => Promise.resolve(credRequest)),
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

describe("Credential request", () => {
  test("Render", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="multi-sign"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={notificationsFix[4]}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request.information
            .title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });
  });
});
