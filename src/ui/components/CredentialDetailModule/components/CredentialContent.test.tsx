import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import {
  connectionDetailsFix,
  credsFixAcdc,
} from "../../../__fixtures__/credsFix";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { identifierFix } from "../../../__fixtures__/identifierFix";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { CredentialContent } from "./CredentialContent";

const getIndentifier = jest.fn(() => identifierFix[0]);

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
}));

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    MISSING_DATA_ON_KERIA:
      "Attempted to fetch data by ID on KERIA, but was not found. May indicate stale data records in the local database.",
    agent: {
      identifiers: {
        getIdentifier: () => getIndentifier(),
      },
      connections: {
        getOobi: jest.fn(() => Promise.resolve("oobi")),
        getMultisigConnections: jest.fn().mockResolvedValue([]),
      }
    },
  },
}));

describe("Creds content", () => {
  test("Render ACDC cedential content", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CredentialContent
          cardData={credsFixAcdc[0]}
          joinedCredRequestMembers={[]}
          connectionShortDetails={connectionDetailsFix}
          setOpenConnectionlModal={jest.fn()}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.about)
    ).toBeVisible();
    expect(getByText(credsFixAcdc[0].s.title)).toBeVisible();
    expect(getByTestId("read-more")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.attributes.label)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.credentialdetails)
    ).toBeVisible();
    expect(getByTestId("credential-issued-label-text-value").innerHTML).toBe(
      EN_TRANSLATIONS.tabs.credentials.details.status.issued
    );
    expect(getByTestId("credential-issued-section-key-value").innerHTML).toBe(
      formatShortDate(credsFixAcdc[0].a.dt)
    );
    expect(getByTestId("credential-issued-section-text-value").innerHTML).toBe(
      formatTimeToSec(credsFixAcdc[0].a.dt)
    );
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.issuer)
    ).toBeVisible();
    expect(getByText(connectionDetailsFix.label)).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.id)
    ).toBeVisible();
    expect(getByTestId("credential-details-id-text-value").innerHTML).toBe(
      credsFixAcdc[0].id.substring(0, 5) + "..." + credsFixAcdc[0].id.slice(-5)
    );
    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.details.schemaversion)
    ).toBeVisible();
    expect(getByTestId("credential-details-schema-version").innerHTML).toBe(
      credsFixAcdc[0].s.version
    );
    expect(
      getByTestId("credential-details-last-status-label-text-value").innerHTML
    ).toBe(EN_TRANSLATIONS.tabs.credentials.details.status.label);
    expect(getByTestId("credential-details-last-status").innerHTML).toBe(
      EN_TRANSLATIONS.tabs.credentials.details.status.issued
    );
    const lastStatus = `${
      EN_TRANSLATIONS.tabs.credentials.details.status.timestamp
    } ${formatShortDate(credsFixAcdc[0].lastStatus.dt)} - ${formatTimeToSec(
      credsFixAcdc[0].lastStatus.dt
    )}`;
    expect(
      getByTestId("credential-details-last-status-timestamp").innerHTML
    ).toBe(lastStatus);
  });

  test("Open related identifier", async () => {
    const state = {
      stateCache: {
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
          passwordIsSkipped: true,
        },
      },
      credsCache: { creds: credsFixAcdc, favourites: [] },
      credsArchivedCache: { creds: credsFixAcdc },
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
    };


    const mockStore = configureStore();
    const storeMocked = {
      ...mockStore(state),
      dispatch: jest.fn(),
    };

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CredentialContent
          cardData={credsFixAcdc[0]}
          joinedCredRequestMembers={[]}
          connectionShortDetails={connectionDetailsFix}
          setOpenConnectionlModal={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.tabs.credentials.details.relatedidentifier)).toBeVisible();
    })

    fireEvent.click(getByTestId("related-identifier-name"));

    await waitFor(() => {
      expect(getByTestId("credential-related-identifier-modal")).toBeVisible();
    });
  });
});
