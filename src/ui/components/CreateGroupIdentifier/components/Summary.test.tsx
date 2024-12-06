import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { ToastMsgType } from "../../../globals/types";
import { IdentifierColor } from "../../CreateIdentifier/components/IdentifierColorSelector";
import { Summary } from "./Summary";
import { Stage } from "../CreateGroupIdentifier.types";

setupIonicReact();
mockIonicReact();

const createMultiSignMock = jest.fn((...args: any) => ({
  identifier: "mock-id",
  isPending: true,
}));

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      multiSigs: {
        createMultisig: (...args: any) => createMultiSignMock(...args),
      },
    },
  },
}));

describe("Create group identifier - Summary", () => {
  const mockStore = configureStore();

  const stage4State = {
    identifierCreationStage: 4,
    displayNameValue: "Duke",
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [],
    selectedConnections: [connectionsFix[0], connectionsFix[1]],
    ourIdentifier: "mock-id",
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
  const setState = jest.fn((args: any) => {
    if (typeof args === "function") {
      const result = args({});

      innerSetState(result);
    }
  });
  const setBlur = jest.fn();
  const resetModal = jest.fn();

  test("Renders default content", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.confirm.title)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.confirm.subtitle)
    ).toBeVisible();
    expect(getByText(stage4State.displayNameValue)).toBeVisible();
    expect(getByText(connectionsFix[0].label)).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.createidentifier.confirm.treshold)
    ).toBeVisible();

    expect(getByTestId("confirm-threshold").innerHTML).toBe(
      String(stage4State.threshold)
    );
  });

  test("Continue button click", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.confirm.continue)
      );
    });

    await waitFor(() => {
      expect(createMultiSignMock).toBeCalledWith(
        "mock-id",
        [connectionsFix[0], connectionsFix[1]],
        stage4State.threshold
      );
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.IDENTIFIER_CREATED)
      );
    });
  });

  test("Continue button click: empty our identifier", async () => {
    const stage4State = {
      identifierCreationStage: 4,
      displayNameValue: "Duke",
      selectedAidType: 0,
      selectedTheme: 0,
      threshold: 1,
      scannedConections: [],
      selectedConnections: [connectionsFix[0], connectionsFix[1]],
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

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.confirm.continue)
      );
    });

    await waitFor(() => {
      expect(createMultiSignMock).not.toBeCalled();
    });
  });

  test("Cancel button click", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.confirm.cancel)
      );
    });

    await waitFor(() => {
      expect(getByTestId("alert-cancel")).toBeVisible();
    });
  });

  test("Back to stage 2", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("confirm-back-connection-button-0"));
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        identifierCreationStage: Stage.Members,
      });
    });
  });

  test("Back to stage 3", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("confirm-back-threshold-button"));
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        identifierCreationStage: Stage.SetupThreshold,
      });
    });
  });

  test("Back button click", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Summary
          state={stage4State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        identifierCreationStage: Stage.SetupThreshold,
      });
    });
  });
});
