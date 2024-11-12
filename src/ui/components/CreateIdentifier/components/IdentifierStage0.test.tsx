import { Capacitor } from "@capacitor/core";
import { IonInput, IonLabel, setupIonicReact } from "@ionic/react";
import { ionFireEvent, mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act, ReactNode } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import { setMultiSigGroupCache } from "../../../../store/reducers/identifiersCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { CustomInputProps } from "../../CustomInput/CustomInput.types";
import { IdentifierColor } from "./IdentifierColorSelector";
import { IdentifierStage0 } from "./IdentifierStage0";
import { IdentifierService } from "../../../../core/agent/services";

setupIonicReact();
mockIonicReact();

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({
    children,
    isOpen,
  }: {
    children: ReactNode;
    isOpen?: boolean;
  }) => <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>,
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: () => {
      return "111111";
    },
  },
}));

const mockGetMultisigConnection = jest.fn((args: unknown) =>
  Promise.resolve([connectionsFix[3]])
);

const createIdentifierMock = jest.fn((args: unknown) => ({
  identifier: "mock-id",
  isPending: true,
}));

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifiersCache: jest.fn(),
        createIdentifier: (args: unknown) => createIdentifierMock(args),
      },
      connections: {
        getMultisigLinkedContacts: (args: unknown) =>
          mockGetMultisigConnection(args),
      },
    },
  },
}));

const addKeyboardEventMock = jest.fn();

jest.mock("@capacitor/keyboard", () => ({
  Keyboard: {
    addListener: (...params: any[]) => addKeyboardEventMock(...params),
  },
}));

jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => true,
    },
  };
});

jest.mock("../../CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <>
        <IonLabel
          position="stacked"
          data-testid={`${props.title?.toLowerCase().replace(" ", "-")}-title`}
        >
          {props.title}
          {props.optional && (
            <span className="custom-input-optional">(optional)</span>
          )}
        </IonLabel>
        <IonInput
          data-testid={props.dataTestId}
          onIonInput={(e) => {
            props.onChangeInput(e.detail.value as string);
          }}
        />
      </>
    );
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
      groupMetadata: undefined,
    },
    color: IdentifierColor.Green,
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const innerSetState = jest.fn();
  const setState = jest.fn((args: unknown) => {
    if (typeof args === "function") {
      const result = args({});

      innerSetState(result);
    }
  });
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  beforeEach(() => {
    createIdentifierMock.mockImplementation(() => ({
      identifier: "mock-id",
      isPending: true,
    }));
    
  })

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
      ionFireEvent.ionInput(displayNameInput, "Test");
    });
    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });
    await waitFor(() => {
      expect(setBlur).toBeCalled();
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.IDENTIFIER_CREATED)
      );
    });
  });

  test("Keyboard event register", () => {
    render(
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

    Capacitor.isNativePlatform = jest.fn().mockImplementation(() => true);

    expect(addKeyboardEventMock).toBeCalledTimes(2);
  });

  test("Multisig create new identifier: mutilsign", async () => {
    const groupMockId = "b75838e5-98cb-46cf-9233-8bf3beca4cd3";

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage0
          state={stage0State}
          setState={setState}
          componentId={"create-identifier-modal"}
          multiSigGroup={{
            groupId: "b75838e5-98cb-46cf-9233-8bf3beca4cd3",
            connections: [connectionsFix[3]],
          }}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(setState).toBeCalledTimes(2);
    });

    const displayNameInput = getByTestId("display-name-input");
    act(() => {
      ionFireEvent.ionInput(displayNameInput, "Test");
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });

    await waitFor(() => {
      expect(mockGetMultisigConnection).toBeCalledTimes(1);
      expect(mockGetMultisigConnection).toBeCalledWith(groupMockId);
      expect(dispatchMock).toBeCalledWith(
        setMultiSigGroupCache({
          groupId: groupMockId,
          connections: [connectionsFix[3]],
        })
      );
      expect(setState).toBeCalledTimes(4);
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.IDLE)
      );
    });
  });

  test("Create new identifier with selected color: Dark", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage0
          state={{
            ...stage0State,
            color: IdentifierColor.Dark,
          }}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(setState).toBeCalledTimes(2);
    });

    const displayNameInput = getByTestId("display-name-input");
    act(() => {
      ionFireEvent.ionInput(displayNameInput, "Test");
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });

    await waitFor(() => {
      expect(createIdentifierMock).toBeCalledWith({
        displayName: "",
        theme: 10,
        groupMetadata: undefined,
      });
      expect(setState).toBeCalledTimes(3);
    });
  });

  test("Display error when display name invalid", async () => {
    createIdentifierMock.mockImplementation(() => {
      throw new Error(IdentifierService.IDENTIFIER_NAME_TAKEN)
    })

    const { getByTestId, getByText, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage0
          state={stage0State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
          multiSigGroup={{
            groupId: "b75838e5-98cb-46cf-9233-8bf3beca4cd3",
            connections: [connectionsFix[3]],
          }}
        />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionInput(getByTestId("display-name-input"), "");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.onlyspace)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("display-name-input"), "   ");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.onlyspace)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("display-name-input"), "Duke Duke Duke Duke  Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.maxlength)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("display-name-input"), "Duke@@");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.hasspecialchar)
      ).toBeVisible();
    });
    
    act(() => {
      ionFireEvent.ionInput(getByTestId("display-name-input"), "Duke");
    });

    await waitFor(() => {
      expect(queryByTestId("error-message")).toBe(null);
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.duplicatename)
      ).toBeVisible();
    });
  });

  test("Show AID type infomation modal", async () => {
    const { getByTestId, getByText, queryByText } = render(
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

    act(() => {
      fireEvent.click(getByTestId("type-input-title"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.title)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.delegated.text)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.individual.text)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.group.text)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.button.done)
      );
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.createidentifier.aidinfo.title)
      ).not.toBeVisible();
      expect(
        queryByText(EN_TRANSLATIONS.createidentifier.aidinfo.delegated.text)
      ).not.toBeVisible();
      expect(
        queryByText(EN_TRANSLATIONS.createidentifier.aidinfo.individual.text)
      ).not.toBeVisible();
      expect(
        queryByText(EN_TRANSLATIONS.createidentifier.aidinfo.group.text)
      ).not.toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("identifier-delegated-container"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.aidinfo.title)
      ).toBeVisible();
    });
  });
});
