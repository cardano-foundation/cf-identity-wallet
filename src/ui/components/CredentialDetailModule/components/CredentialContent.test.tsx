import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import {
  connectionDetailsFix,
  credsFixAcdc,
} from "../../../__fixtures__/credsFix";
import { CredentialContent } from "./CredentialContent";
import { store } from "../../../../store";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";

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
});
