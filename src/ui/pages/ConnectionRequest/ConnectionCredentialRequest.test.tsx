import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import i18next from "i18next";
import { CredentialExchangeRecord } from "@aries-framework/core";
import { store } from "../../../store";
import { ConnectionCredentialRequest } from "./ConnectionCredentialRequest";
import { setConnectionCredentialRequest } from "../../../store/reducers/stateCache";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { AriesAgent } from "../../../core/agent/agent";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { i18n } from "../../../i18n";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        acceptRequestConnection: jest.fn(),
        acceptResponseConnection: jest.fn(),
      },
      credentials: {
        getCredentialRecordById: jest.fn(),
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
  beforeAll(() => {
    jest
      .spyOn(AriesAgent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(connectionMock);
  });

  test("It renders connection request incoming", async () => {
    store.dispatch(
      setConnectionCredentialRequest({
        id: "123",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
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
          i18n.t("request.connection-title").toString()
        );
        expect(label).toBeInTheDocument();
      },
      { container: container }
    );
  });

  test("It renders connection request incoming and confirm request", async () => {
    const id = "123";
    store.dispatch(
      setConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      })
    );
    const acceptRequestConnectionSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "acceptRequestConnection"
    );

    const { container, findByTestId, findByText } = render(
      <Provider store={store}>
        <ConnectionCredentialRequest />
      </Provider>
    );
    const continueButton = await findByTestId("continue-button");
    const alertElement = await findByTestId("alert-confirm");
    act(() => {
      fireEvent.click(continueButton);
    });

    await waitFor(
      () => {
        expect(alertElement.className).toEqual("alert-visible");
      },
      { container: container }
    );
    const confirmText = await findByText(
      i18next
        .t("request.alert.title-confirm-connection", {
          initiator: connectionMock.label,
        })
        .toString(),
      { exact: false }
    );
    expect(confirmText).toBeInTheDocument();

    const btnConfirm = await findByText(
      i18n.t("request.alert.confirm-connection").toString()
    );
    expect(btnConfirm).toBeInTheDocument();

    act(() => {
      btnConfirm.click();
    });

    await waitFor(() => {
      expect(acceptRequestConnectionSpy).toBeCalledWith(id);
    });
  });

  test("It renders connection response and confirm request", async () => {
    const id = "123";
    store.dispatch(
      setConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CONNECTION_RESPONSE,
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

    const btnConfirm = await findByText(
      i18n.t("request.alert.confirm-connection").toString()
    );

    act(() => {
      btnConfirm.click();
    });

    expect(acceptResponseConnectionSpy).toBeCalledWith(id);
  });
});

describe("Credential request", () => {
  beforeAll(() => {
    jest
      .spyOn(AriesAgent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(connectionMock);
    jest
      .spyOn(AriesAgent.agent.credentials, "getCredentialRecordById")
      .mockResolvedValue({
        connectionId: connectionMock.id,
      } as CredentialExchangeRecord);
  });

  test("It renders credential request and accept credential", async () => {
    const id = "456";
    store.dispatch(
      setConnectionCredentialRequest({
        id: id,
        type: ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED,
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

    const btnConfirm = await findByText(
      i18n.t("request.alert.confirm-credential").toString()
    );
    act(() => {
      btnConfirm.click();
    });

    expect(acceptCredentialOfferSpy).toBeCalledWith(id);
  });

  test("It renders credential request and decline credential", async () => {
    const id = "68";
    store.dispatch(
      setConnectionCredentialRequest({
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
