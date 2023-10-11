import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { CLEAR_STATE_DELAY, CardsStack, NAVIGATION_DELAY } from "./CardsStack";
import { identityFix } from "../../__fixtures__/identityFix";
import { store } from "../../../store";
import { DidCardDetails } from "../../pages/DidCardDetails";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { credsFix } from "../../__fixtures__/credsFix";
import { CredCardDetails } from "../../pages/CredCardDetails";
import { cardTypes } from "../../constants/dictionary";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { AriesAgent } from "../../../core/agent/agent";
jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      identifiers: {
        getIdentifier: jest
          .fn()
          .mockResolvedValue({ type: "key", result: identityFix[0] }),
      },
      credentials: {
        getCredentialDetailsById: jest.fn().mockResolvedValue({}),
      },
    },
  },
}));
describe("Cards Stack Component", () => {
  test("It renders Cards Stack", () => {
    const { getByText } = render(
      <Provider store={store}>
        <CardsStack
          cardsType={cardTypes.dids}
          cardsData={identityFix}
        />
      </Provider>
    );
    const firstCardId = getByText(identityFix[0].id);
    expect(firstCardId).toBeInTheDocument();
  });

  test("It renders on Cred card with card pending", () => {
    const { getByText } = render(
      <Provider store={store}>
        <CardsStack
          cardsType={cardTypes.creds}
          cardsData={[
            { ...credsFix[0], status: CredentialMetadataRecordStatus.PENDING },
          ]}
        />
      </Provider>
    );
    const labelPending = getByText(CredentialMetadataRecordStatus.PENDING);
    expect(labelPending).toBeInTheDocument();
  });

  test("It navigates to Did Card Details and back", async () => {
    jest.useFakeTimers();
    const { findByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            cardsType={cardTypes.dids}
            cardsData={identityFix}
          />
          <Route
            path={TabsRoutePath.DID_DETAILS}
            component={DidCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = await findByTestId("did-card-stack-index-0");
    await waitFor(() => expect(firstCard).not.toHaveClass("active"));

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    await waitFor(() => expect(firstCard).toHaveClass("active"));

    const doneButton = await findByTestId("tab-title-done");
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
      .mockResolvedValue(credsFix[0]);
    const { findByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            cardsType={cardTypes.creds}
            cardsData={credsFix}
          />
          <Route
            path={TabsRoutePath.CRED_DETAILS}
            component={CredCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = await findByTestId("cred-card-stack-index-0");
    await waitFor(() => expect(firstCard).not.toHaveClass("active"));

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    await waitFor(() => expect(firstCard).toHaveClass("active"));

    const doneButton = await findByTestId("tab-title-done");
    act(() => {
      fireEvent.click(doneButton);
      jest.advanceTimersByTime(CLEAR_STATE_DELAY);
    });

    await waitFor(() => expect(firstCard).not.toHaveClass("active"));
  });
});
