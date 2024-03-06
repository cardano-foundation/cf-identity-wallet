import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { CLEAR_STATE_DELAY, CardsStack, NAVIGATION_DELAY } from "./CardsStack";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { store } from "../../../store";
import { IdentifierCardDetails } from "../../pages/IdentifierCardDetails";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { credsFixW3c } from "../../__fixtures__/credsFix";
import { CredCardDetails } from "../../pages/CredCardDetails";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { AriesAgent } from "../../../core/agent/agent";
import { CardType } from "../../globals/types";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue({
          type: "key",
          result: {
            id: "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQv",
            method: "key",
            displayName: "Anonymous ID",
            createdAtUTC: "2023-01-01T19:23:24Z",
            colors: ["#92FFC0", "#47FF94"],
            theme: 0,
            keyType: "Ed25519",
            controller:
              "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQv",
            publicKeyBase58: "AviE3J4duRXM6AEvHSUJqVnDBYoGNXZDGUjiSSh96LdY",
          },
        }),
        checkMultisigComplete: jest.fn().mockResolvedValue(true),
      },
      credentials: {
        getCredentialDetailsById: jest.fn().mockResolvedValue({}),
      },
      genericRecords: {
        findById: jest.fn(),
      },
    },
  },
}));

describe("Cards Stack Component", () => {
  test("It renders Cards Stack", () => {
    const { getByText } = render(
      <Provider store={store}>
        <CardsStack
          name="example"
          cardsType={CardType.IDENTIFIERS}
          cardsData={identifierFix}
        />
      </Provider>
    );
    const firstCardId = getByText(
      identifierFix[0].id.substring(8, 13) +
        "..." +
        identifierFix[0].id.slice(-5)
    );
    expect(firstCardId).toBeInTheDocument();
  });

  test("It renders on Cred card with card pending", () => {
    const { getByText } = render(
      <Provider store={store}>
        <CardsStack
          name="example"
          cardsType={CardType.CREDS}
          cardsData={[
            {
              ...credsFixW3c[0],
              status: CredentialMetadataRecordStatus.PENDING,
            },
          ]}
        />
      </Provider>
    );
    const labelPending = getByText(CredentialMetadataRecordStatus.PENDING);
    expect(labelPending).toBeInTheDocument();
  });

  test("It navigates to Identifier Card Details and back", async () => {
    jest.useFakeTimers();
    const { findByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            name="example"
            cardsType={CardType.IDENTIFIERS}
            cardsData={identifierFix}
          />
          <Route
            path={TabsRoutePath.IDENTIFIER_DETAILS}
            component={IdentifierCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = await findByTestId(
      "identifier-card-template-example-index-0"
    );
    await waitFor(() => expect(firstCard).not.toHaveClass("active"));

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    await waitFor(() => expect(firstCard).toHaveClass("active"));

    const doneButton = await findByTestId("tab-done-button");
    act(() => {
      fireEvent.click(doneButton);
      jest.advanceTimersByTime(CLEAR_STATE_DELAY);
    });

    await waitFor(() => expect(firstCard).not.toHaveClass("active"));
  });

  test("It navigates to Cred Card Details and back", async () => {
    jest.useFakeTimers();
    jest
      .spyOn(AriesAgent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixW3c[0]);
    const { findByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            name="example"
            cardsType={CardType.CREDS}
            cardsData={credsFixW3c}
          />
          <Route
            path={TabsRoutePath.CRED_DETAILS}
            component={CredCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = await findByTestId("cred-card-template-example-index-0");
    await waitFor(() => expect(firstCard).not.toHaveClass("active"));

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    await waitFor(() => expect(firstCard).toHaveClass("active"));

    const doneButton = await findByTestId("tab-done-button");
    act(() => {
      fireEvent.click(doneButton);
      jest.advanceTimersByTime(CLEAR_STATE_DELAY);
    });

    await waitFor(() => expect(firstCard).not.toHaveClass("active"));
  });
});
