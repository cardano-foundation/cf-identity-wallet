import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import i18next from "i18next";
import { store } from "../../../store";
import { ConnectionCredentialRequest } from "./ConnectionCredentialRequest";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { AriesAgent } from "../../../core/agent/agent";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { i18n } from "../../../i18n";
import {
  setQueueConnectionCredentialRequest,
  dequeueCredentialCredentialRequest,
} from "../../../store/reducers/stateCache";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      connections: {
        acceptRequestConnection: jest.fn(),
        acceptResponseConnection: jest.fn(),
      },
      credentials: {
        acceptCredentialOffer: jest.fn(),
        declineCredentialOffer: jest.fn(),
      },
    },
  },
}));
jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
  },
}));

const connectionMock = connectionsFix[0];

describe("Connection request", () => {
  afterEach(() => {
    store.dispatch(dequeueCredentialCredentialRequest());
  });
  test("It renders connection request incoming", async () => {
    store.dispatch(
      setQueueConnectionCredentialRequest({
        id: "123",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
        logo: connectionMock.logo,
        label: connectionMock.label,
      })
    );
    const { container, getByText } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    await waitFor(
      () => {
        const title = container.querySelector("h2");
        const label = getByText(connectionMock.label);
        expect(title).toHaveTextContent(
          i18n.t("request.connection.title").toString()
        );
        expect(label).toBeInTheDocument();
      },
      { container: container }
    );
  });

  test("It renders connection request incoming and confirm request", async () => {
    const id = "123";
    store.dispatch(
      setQueueConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
        logo: connectionMock.logo,
        label: connectionMock.label,
      })
    );
    const acceptRequestConnectionSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "acceptRequestConnection"
    );

    const { findByTestId } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    const continueButton = await findByTestId("continue-button");

    expect(continueButton).toBeInTheDocument();

    act(() => {
      continueButton.click();
    });

    await waitFor(() => {
      expect(acceptRequestConnectionSpy).toBeCalledWith(id);
    });
  });

  test("It renders connection response and confirm request", async () => {
    const id = "123";
    store.dispatch(
      setQueueConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CONNECTION_RESPONSE,
        logo: connectionMock.logo,
        label: connectionMock.label,
      })
    );
    const acceptResponseConnectionSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "acceptResponseConnection"
    );

    const { findByTestId, findByText } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    const continueButton = await findByTestId("continue-button");
    act(() => {
      fireEvent.click(continueButton);
    });

    expect(acceptResponseConnectionSpy).toBeCalledWith(id);
  });
});

describe("Credential request", () => {
  afterEach(() => {
    store.dispatch(dequeueCredentialCredentialRequest());
  });

  test("It renders credential request and accept credential", async () => {
    const id = "456";
    store.dispatch(
      setQueueConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: connectionMock.logo,
        label: connectionMock.label,
      })
    );
    const acceptCredentialOfferSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "acceptCredentialOffer"
    );

    const { findByTestId, findByText } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    const continueButton = await findByTestId("continue-button");
    act(() => {
      fireEvent.click(continueButton);
    });

    expect(acceptCredentialOfferSpy).toBeCalledWith(id);
  });

  test("It renders credential request and decline credential", async () => {
    const id = "68";
    store.dispatch(
      setQueueConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED,
      })
    );
    const declineCredentialOfferSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "declineCredentialOffer"
    );

    const { findByText } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    const btnCancel = await findByText(
      i18n.t("request.alert.cancel").toString()
    );
    act(() => {
      btnCancel.click();
    });
    await waitFor(() => {
      expect(declineCredentialOfferSpy).toBeCalledWith(id);
    });
  });
});
