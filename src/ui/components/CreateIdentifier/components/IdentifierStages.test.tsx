import { setupIonicReact } from "@ionic/react";
import { mockIonicReact, waitForIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import { TabsRoutePath } from "../../navigation/TabsMenu";
import { IdentifierStage0 } from "./IdentifierStage0";
import { IdentifierStage1 } from "./IdentifierStage1";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
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

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifiersCache: jest.fn(),
      },
    },
  },
}));

describe("Identifier Stage 0", () => {
  const mockStore = configureStore();

  const stage0State = {
    identifierCreationStage: 0,
    displayNameValue: "",
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [],
    selectedConnections: [],
    ourIdentifier: "",
    newIdentifier: {
      id: "",
      displayName: "",
      createdAtUTC: "",
      theme: 0,
      isPending: false,
      signifyName: "",
      groupMetadata: undefined,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const setState = jest.fn();
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  test("IdentifierStage0 renders default content", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <IdentifierStage0
          state={stage0State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.add.title)
    ).toBeInTheDocument();
    expect(getByTestId("display-name-title")).toBeInTheDocument();
    expect(getByTestId("display-name-input")).toBeInTheDocument();
    expect(getByTestId("aid-type-selector")).toBeInTheDocument();
    expect(getByTestId("identifier-theme-selector")).toBeInTheDocument();
    expect(
      getByTestId("primary-button-create-identifier-modal")
    ).toBeInTheDocument();
  });

  test("IdentifierStage0 shows blur when creating a new Default identifier", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage0
          state={stage0State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
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
    await waitFor(() => {
      expect(setBlur).toBeCalled();
    });
  });
});

describe("Identifier Stage 1 Initial", () => {
  const mockStore = configureStore();

  const stage1State = {
    identifierCreationStage: 1,
    displayNameValue: "test",
    selectedAidType: 1,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [],
    selectedConnections: [],
    ourIdentifier: "",
    newIdentifier: {
      id: "identifier",
      displayName: "test",
      createdAtUTC: new Date().toISOString(),
      theme: 0,
      isPending: false,
      signifyName: "signifyName",
      groupMetadata: {
        groupId: "a2c1ac9e-fbaf-4cfd-83fb-7008d9661898",
        groupInitiator: true,
        groupCreated: true,
      },
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const setState = jest.fn();
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  test("IdentifierStage1 renders Initial Multi Sig content", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <IdentifierStage1
          state={stage1State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
          multiSigGroup={undefined}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.notes.top)
    ).toBeInTheDocument();
    expect(getByTestId("multisig-share-qr-code")).toBeInTheDocument();
    expect(
      getByTestId("multisig-copy-oobi-connection-button")
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.notes.middle)
    ).toBeInTheDocument();
    expect(
      getByTestId("share-identifier-scan-button-round")
    ).toBeInTheDocument();
    act(() => {
      fireEvent.click(getByTestId("share-identifier-scan-button-round"));
    });
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.share.scanalert.text)
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.share.scanalert.confirm)
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.share.scanalert.cancel)
      ).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.share.scanalert.confirm)
      );
    });
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.share.scanbutton)
      ).toBeInTheDocument();
    });
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.subtitle)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.notes.bottom)
    ).toBeInTheDocument();
    expect(
      getByTestId("primary-button-initiate-multi-sig")
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        getByTestId("primary-button-initiate-multi-sig").getAttribute(
          "disabled"
        )
      ).toBe("true");
    });
  });
});

describe("Identifier Stage 1 Resumed State", () => {
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
    },
    identifiersCache: {
      identifiers: [],
      favourites: [],
      multiSigGroup: {
        groupId: "b75838e5-98cb-46cf-9233-8bf3beca4cd3",
        connections: [connectionsFix[3]],
      },
    },
  };

  const stage1State = {
    identifierCreationStage: 1,
    displayNameValue: "test",
    selectedAidType: 1,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [connectionsFix[3]],
    selectedConnections: [],
    ourIdentifier: "EJFrDZPw6atTkQr__ZoyOrl2ZzsN82wrx0m7I0BREKL2",
    newIdentifier: {
      id: "identifier",
      displayName: "test",
      createdAtUTC: new Date().toISOString(),
      theme: 0,
      isPending: false,
      signifyName: "signifyName",
      groupMetadata: {
        groupId: "a2c1ac9e-fbaf-4cfd-83fb-7008d9661898",
        groupInitiator: true,
        groupCreated: true,
      },
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const setState = jest.fn();
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  test.skip("IdentifierStage1 renders Resume Multi Sig content", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <IdentifierStage1
          state={stage1State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
          resumeMultiSig={stage1State.newIdentifier}
          multiSigGroup={undefined}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.notes.top)
    ).toBeInTheDocument();
    expect(getByTestId("multisig-share-qr-code")).toBeInTheDocument();
    expect(
      getByTestId("multisig-copy-oobi-connection-button")
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.notes.middle)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.share.subtitle)
    ).toBeInTheDocument();
    expect(getByText(connectionsFix[3].label)).toBeInTheDocument();
    expect(
      getByTestId("primary-button-initiate-multi-sig")
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        getByTestId("primary-button-initiate-multi-sig").getAttribute(
          "disabled"
        )
      ).toBe("false");
    });
  });
});
