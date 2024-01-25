import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import {
  credsFixW3c,
  credsFixAcdc,
  connectionDetailsFix,
} from "../../../__fixtures__/credsFix";
import { CredContentW3c } from "./CredContentW3c";
import { CredContentAcdc } from "./CredContentAcdc";
import { store } from "../../../../store";

describe("Creds content", () => {
  test("Render University Degree Credential content", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CredContentW3c
          cardData={credsFixW3c[0]}
          connectionDetails={connectionDetailsFix}
        />
      </Provider>
    );
    expect(getByTestId("card-details-credential-type")).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.creds.card.details.type)).toBeVisible();
    expect(getByText("University Degree Credential")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.attributes.label)
    ).toBeVisible();
    expect(getByTestId("card-details-attributes-id")).toBeVisible();
    expect(
      getByText("did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg")
    ).toBeVisible();
    expect(getByText("John Smith")).toBeVisible();
    expect(getByText("BachelorDegree")).toBeVisible();
    expect(getByText("Bachelor of Science and Arts")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.connection)
    ).toBeVisible();
    expect(getByText("test_label")).toBeVisible();
    expect(getByText("test_id")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.issuancedate)
    ).toBeVisible();
    expect(getByText("24/01/2024 - 16:20:26")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.expirationdate)
    ).toBeVisible();
    expect(getByText("N/A")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.prooftypes)
    ).toBeVisible();
    expect(getByText("Ed25519Signature2018")).toBeVisible();
    expect(
      getByText(
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..lA7RYE786YdgsnaW98i0dydg_wMdDyRcIx5fiV0er02rfiQHlvjg-QrFyR_NQ8IRQZrOQ_d55WyY97dqW5i8BQ"
      )
    ).toBeVisible();
  });

  test("Render Access Pass Credential content", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CredContentW3c
          cardData={credsFixW3c[1]}
          connectionDetails={connectionDetailsFix}
        />
      </Provider>
    );
    expect(getByTestId("card-details-credential-type")).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.creds.card.details.type)).toBeVisible();
    expect(getByText("Access Pass Credential")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.attributes.label)
    ).toBeVisible();
    expect(getByTestId("card-details-attributes-id")).toBeVisible();
    expect(
      getByText("did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg")
    ).toBeVisible();
    expect(getByText("AccessPass")).toBeVisible();
    expect(getByText("Cardano Summit 2023")).toBeVisible();
    expect(getByText("4c44c251-eaa3-4c77-be07-d378b7b98497")).toBeVisible();
    expect(getByText("John Smith")).toBeVisible();
    expect(getByText("November 2, 2023")).toBeVisible();
    expect(getByText("November 3, 2023")).toBeVisible();
    expect(getByText("Dubai, UAE")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.connection)
    ).toBeVisible();
    expect(getByText("test_label")).toBeVisible();
    expect(getByText("test_id")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.issuancedate)
    ).toBeVisible();
    expect(getByText("24/01/2024 - 16:19:33")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.expirationdate)
    ).toBeVisible();
    expect(getByText("N/A")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.prooftypes)
    ).toBeVisible();
    expect(getByText("Ed25519Signature2018")).toBeVisible();
    expect(
      getByText(
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BagLUeFaMa9KYkPDqbBbElVxxF_zoxLxSb15p10Sm7FGudUsAYMorcxSwEOdp1Mw94oEUI-tNi8b5sr-qi3ADA"
      )
    ).toBeVisible();
  });

  test("Render Permanent Resident Card content", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CredContentW3c
          cardData={credsFixW3c[2]}
          connectionDetails={connectionDetailsFix}
        />
      </Provider>
    );
    expect(getByTestId("card-details-credential-type")).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.creds.card.details.type)).toBeVisible();
    expect(getByText("Permanent Resident Card")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.attributes.label)
    ).toBeVisible();
    expect(getByTestId("card-details-attributes-id")).toBeVisible();
    expect(
      getByText("did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4B")
    ).toBeVisible();
    expect(getByText("PermanentResident")).toBeVisible();
    expect(getByText("Person")).toBeVisible();
    expect(getByText("The Bahamas")).toBeVisible();
    expect(getByText("John")).toBeVisible();
    expect(getByText("Smith")).toBeVisible();
    expect(getByText("Male")).toBeVisible();
    expect(
      getByText(
        "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/static/ResIdImg.jpg"
      )
    ).toBeVisible();
    expect(getByText("10/10/2022 - 11:12:12")).toBeVisible();
    expect(getByText("C09")).toBeVisible();
    expect(getByText("999-999-999")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.connection)
    ).toBeVisible();
    expect(getByText("test_label")).toBeVisible();
    expect(getByText("test_id")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.issuancedate)
    ).toBeVisible();
    expect(getByText("24/01/2024 - 16:21:09")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.expirationdate)
    ).toBeVisible();
    expect(getByText("12/12/2025 - 12:12:12")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.prooftypes)
    ).toBeVisible();
    expect(getByText("Ed25519Signature2018")).toBeVisible();
    expect(
      getByText(
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..d4Q4yDkg_xDk3RDrggtKiiCLaUpY2Nnq4otLNXvAZZ9due3hu9ES6T3NrrUDAs6627uJLe-fUPbcg0chSNcQBA"
      )
    ).toBeVisible();
  });

  test("Render ACDC cedential content", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CredContentAcdc cardData={credsFixAcdc[0]} />
      </Provider>
    );
    expect(getByTestId("card-details-credential-type")).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.creds.card.details.title)).toBeVisible();
    expect(getByText("Qualified vLEI Issuer Credential")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.description.label)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.description.content)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.attributes.label)
    ).toBeVisible();
    expect(
      getByText("EJWgO4hwKxNMxu2aUpmGFMozKt9Eq2Jz8n-xXR7CYtY_")
    ).toBeVisible();
    expect(getByText("22/01/2024 - 16:03:44")).toBeVisible();
    expect(getByText("5493001KJTIIGC8Y1R17")).toBeVisible();
    expect(getByText("1.0.0")).toBeVisible();
    expect(
      getByText("EGvs2tol4NEtRvYFQDwzRJNnxZgAiGbM4iHB3h4gpRN5")
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.status.label)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.status.label + ":")
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.status.timestamp + ":")
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.creds.card.details.status.issued)
    ).toBeVisible();
    expect(getByText("22/01/2024 - 16:05:44")).toBeVisible();
  });
});
