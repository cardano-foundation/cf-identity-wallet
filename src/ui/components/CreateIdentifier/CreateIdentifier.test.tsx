import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { CreateIdentifier } from "./CreateIdentifier";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { setMultiSigGroupCache } from "../../../store/reducers/identifiersCache";
import { identifierFix } from "../../__fixtures__/identifierFix";
import EN_TRANSLATION from "../../../locales/en/en.json";
setupIonicReact();
mockIonicReact();

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
  ),
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
  },
}));

const mockGetMultisigConnection = jest.fn((args) => Promise.resolve([]));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getMultisigLinkedContacts: (args: any) =>
          mockGetMultisigConnection(args),
      },
    },
  },
}));

describe("Create Identifier modal", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
      queueIncomingRequest: {
        isProcessing: false,
        queues: [],
        isPaused: false,
      },
      isOnline: true,
    },
    identifiersCache: {
      identifiers: [],
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It can dismiss the modal", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          resumeMultiSig={null}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATION.createidentifier.cancel));
    });
    expect(getByTestId("create-identifier-modal-content-page")).toHaveClass(
      "ion-hide"
    );
  });

  test("Update multisig group", async () => {
    render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          groupId="mockId"
        />
      </Provider>
    );

    await waitFor(() => {
      expect(mockGetMultisigConnection).toBeCalledWith("mockId");
      expect(dispatchMock).toBeCalledWith(
        setMultiSigGroupCache({
          groupId: "mockId",
          connections: [],
        })
      );
    });
  });

  test("Resume multisig group", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          groupId="mockId"
          resumeMultiSig={identifierFix[0]}
          setResumeMultiSig={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATION.createidentifier.share.title)
      ).toBeVisible();
    });
  });

  test("It shows the spinner and closes the modal when creating a new Default identifier", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          resumeMultiSig={null}
        />
      </Provider>
    );
    const displayNameInput = getByTestId("display-name-input");
    act(() => {
      fireEvent.change(displayNameInput, { target: { value: "Test" } });
    });
    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });
    expect(getByTestId("spinner-container")).toBeVisible();
    expect(getByTestId("create-identifier-modal-content-page")).toHaveClass(
      "ion-hide"
    );
  });
});
