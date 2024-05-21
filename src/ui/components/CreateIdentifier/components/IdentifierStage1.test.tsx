import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { TabsRoutePath } from "../../navigation/TabsMenu";
import { IdentifierStage1 } from "./IdentifierStage1";

setupIonicReact();
mockIonicReact();

const getOobiMock = jest.fn((...args: any) =>
  Promise.resolve(
    "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902"
  )
);

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getOobi: (...args: any) => getOobiMock(...args),
      },
    },
  },
}));

const historyPushMock = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: (args: any) => {
      historyPushMock(args);
    },
  }),
}));

describe("Identifier Stage 1", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
        userName: "Duke",
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

  const innerSetState = jest.fn();
  const setState = jest.fn((args: any) => {
    if (typeof args === "function") {
      const result = args({});

      innerSetState(result);
    }
  });
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  test("Render and initial multisig", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage1
          state={stage1State}
          setState={setState}
          componentId={"create-identifier"}
          setBlur={setBlur}
          resetModal={resetModal}
          resumeMultiSig={stage1State.newIdentifier}
          multiSigGroup={undefined}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getOobiMock).toBeCalledWith(
        stage1State.newIdentifier.signifyName,
        initialState.stateCache.authentication.userName,
        stage1State.newIdentifier.groupMetadata.groupId
      );
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-initiate-multi-sig"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.IDLE)
      );
    });

    expect(innerSetState).toBeCalledWith({
      scannedConections: [connectionsFix[3]],
      displayNameValue: stage1State.displayNameValue,
      ourIdentifier: stage1State.ourIdentifier,
      identifierCreationStage: 2,
    });
  });

  test("Has multisign incoming request", async () => {
    const mockStore = configureStore();

    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
          userName: "Duke",
        },
        queueIncomingRequest: {
          isProcessing: true,
          queues: [
            {
              id: "abc123456",
              type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
              multisigIcpDetails: {
                ourIdentifier: {
                  ...filteredIdentifierFix[0],
                  groupMetadata: {
                    groupId: "a2c1ac9e-fbaf-4cfd-83fb-7008d9661898",
                    groupInitiator: true,
                    groupCreated: true,
                  },
                },
                sender: connectionsFix[3],
                otherConnections: [connectionsFix[4], connectionsFix[5]],
                threshold: 1,
              },
            },
          ],
          isPaused: false,
        },
      },
      identifiersCache: {
        identifiers: [],
        favourites: [],
        multiSigGroup: {
          groupId: "b75838e5-98cb-46cf-9233-8bf3beca4cd3",
          connections: [connectionsFix[3], connectionsFix[4]],
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <IdentifierStage1
            state={stage1State}
            setState={setState}
            componentId={"create-identifier"}
            setBlur={setBlur}
            resetModal={resetModal}
            resumeMultiSig={{
              ...stage1State.newIdentifier,
              groupMetadata: {
                ...stage1State.newIdentifier.groupMetadata,
                groupInitiator: false,
              },
            }}
            multiSigGroup={{
              groupId: "b75838e5-98cb-46cf-9233-8bf3beca4cd3",
              connections: [connectionsFix[3]],
            }}
          />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(resetModal).toBeCalledTimes(1);
      expect(historyPushMock).toBeCalledWith({
        pathname: TabsRoutePath.IDENTIFIERS,
      });
    });

    act(() => {
      fireEvent.click(getByTestId("share-resume-identifier-scan-button"));
    });

    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(OperationType.MULTI_SIG_RECEIVER_SCAN)
    );
  });

  describe("Initial Identifier", () => {
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

    test("Renders Initial Multi Sig", async () => {
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

    test("Renders Initial Multi Sig: groupInitiator is false", async () => {
      const { getByTestId, getByText } = render(
        <Provider store={storeMocked}>
          <IdentifierStage1
            state={{
              ...stage1State,
              newIdentifier: {
                ...stage1State.newIdentifier,
                signifyName: "",
                groupMetadata: {
                  ...stage1State.newIdentifier.groupMetadata,
                  groupInitiator: false,
                },
              },
            }}
            setState={setState}
            componentId={"create-identifier-modal"}
            setBlur={setBlur}
            resetModal={resetModal}
            multiSigGroup={undefined}
          />
        </Provider>
      );

      expect(
        getByText(EN_TRANSLATIONS.createidentifier.receive.notes.top)
      ).toBeInTheDocument();
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.receive.notes.middle)
      ).toBeInTheDocument();

      act(() => {
        fireEvent.click(getByTestId("multisig-copy-oobi-connection-button"));
      });

      await waitFor(() => {
        expect(dispatchMock).toBeCalledWith(
          setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
        );
      });
    });
  });

  describe("Resume Create Identifier", () => {
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

    test("Renders Resume Multi Sig content", async () => {
      const { getByTestId, getByText } = render(
        <Provider store={storeMocked}>
          <IdentifierStage1
            state={stage1State}
            setState={setState}
            componentId={"create-identifier"}
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
      expect(getByTestId("copy-button-create-identifier")).toBeInTheDocument();
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

      act(() => {
        fireEvent.click(getByTestId("copy-button-create-identifier"));
      });

      await waitFor(() => {
        expect(dispatchMock).toBeCalledWith(
          setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
        );
      });
    });

    test("Renders Resume Multi Sig with groupInitiator is false", async () => {
      const { getByText } = render(
        <Provider store={storeMocked}>
          <IdentifierStage1
            state={stage1State}
            setState={setState}
            componentId={"create-identifier"}
            setBlur={setBlur}
            resetModal={resetModal}
            resumeMultiSig={{
              ...stage1State.newIdentifier,
              groupMetadata: {
                ...stage1State.newIdentifier.groupMetadata,
                groupInitiator: false,
              },
            }}
            multiSigGroup={undefined}
          />
        </Provider>
      );

      expect(
        getByText(EN_TRANSLATIONS.createidentifier.receive.notes.top)
      ).toBeInTheDocument();
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.receive.notes.middle)
      ).toBeInTheDocument();
    });
  });
});
