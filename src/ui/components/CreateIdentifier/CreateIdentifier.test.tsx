/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { CreateIdentifier } from "./CreateIdentifier";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredKeriFix } from "../../__fixtures__/filteredIdentifierFix";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

describe("CreateIdentifier modal", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: ["/"],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    connectionsCache: {
      connections: connectionsFix,
    },
    identifiersCache: {
      identifiers: filteredKeriFix,
      favourites: [],
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It renders component successfully and can dismiss the modal", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.title)
    ).toBeInTheDocument();
    fireEvent.click(getByTestId("close-button"));
    expect(getByTestId("create-identifier-modal-content-page")).toHaveClass(
      "ion-hide"
    );
  });
  test("It can create did:key identifier", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
        />
      </Provider>
    );
    const displayNameInput = getByTestId("display-name-input");
    fireEvent.change(displayNameInput, { target: { value: "Test" } });
    fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    expect(getByTestId("spinner-container")).toBeVisible();
  });
  test("It can navigate all the way to the last stage of Multi-Sig creation", async () => {
    const { getByTestId, getByText, getByRole } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
        />
      </Provider>
    );
    const displayNameInput = getByTestId("display-name-input");
    fireEvent.change(displayNameInput, { target: { value: "Test" } });
    fireEvent.click(
      getByText(EN_TRANSLATIONS.createidentifier.identifiertype.keri)
    );
    fireEvent.click(
      getByText(EN_TRANSLATIONS.createidentifier.aidtype.multisig.label)
    );
    fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.connections.title)
    ).toBeInTheDocument();
    fireEvent.click(getByTestId("connection-checkbox-0"));
    fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.threshold.title)
    ).toBeInTheDocument();
    fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.confirm.title)
    ).toBeInTheDocument();
  });
});
