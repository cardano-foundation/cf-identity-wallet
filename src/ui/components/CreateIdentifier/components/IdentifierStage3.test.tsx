import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { store } from "../../../../store";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { IdentifierStage3 } from "./IdentifierStage3";

setupIonicReact();
mockIonicReact();

describe("Identifier Stage 3", () => {
  const mockStore = configureStore();

  const stage3State = {
    identifierCreationStage: 3,
    displayNameValue: "",
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [],
    selectedConnections: [connectionsFix[0]],
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
        <IdentifierStage3
          state={stage3State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.threshold.title)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.threshold.subtitle)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.threshold.label)
    ).toBeVisible();
    expect(getByTestId("decrease-threshold-button")).toBeVisible();
    expect(getByTestId("increase-threshold-button")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.createidentifier.threshold.continue)
    ).toBeVisible();
  });

  test("Continue button click", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <IdentifierStage3
          state={stage3State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createidentifier.threshold.continue)
      );
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        identifierCreationStage: 4,
      });
    });
  });

  test("Increase/decrease threshold", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage3
          state={stage3State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("increase-threshold-button"));
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        threshold: 2,
      });
    });

    act(() => {
      fireEvent.click(getByTestId("decrease-threshold-button"));
    });

    expect(innerSetState).not.toHaveBeenNthCalledWith(2);
  });

  test("Back button click", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <IdentifierStage3
          state={stage3State}
          setState={setState}
          componentId={"create-identifier-modal"}
          setBlur={setBlur}
          resetModal={resetModal}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.createidentifier.back));
    });

    await waitFor(() => {
      expect(innerSetState).toBeCalledWith({
        identifierCreationStage: 2,
        threshold: 1,
      });
    });
  });
});
