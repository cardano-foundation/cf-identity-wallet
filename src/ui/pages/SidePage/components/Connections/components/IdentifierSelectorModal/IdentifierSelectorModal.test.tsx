import { setupIonicReact } from "@ionic/react";
import { mockIonicReact, waitForIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { ReactNode } from "react";
import EN_TRANSLATIONS from "../../../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../../../routes/paths";
import { IdentifierSelectorModal } from "./IdentifierSelectorModal";

setupIonicReact();
mockIonicReact();

const identifierCache = [
  {
    displayName: "mutil sign",
    id: "testid_00",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
    multisigManageAid: "EHNPqg5RyNVWfpwUYDK135xuUMFGK1GXZoDVqGc0DPsy",
  },
  {
    displayName: "mutil sign 1",
    id: "testid_0",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
    groupMetadata: {
      groupId: "test",
      groupInitiator: true,
      groupCreated: true,
    },
  },
  {
    displayName: "mutil sign 2",
    id: "testid_1",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
  },
];

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: { children: ReactNode; isOpen: true }) => (
    <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
  ),
}));

describe("Identifier Selector Modal", () => {
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
    },
    walletConnectionsCache: {
      walletConnections: [],
    },
    identifiersCache: {
      identifiers: identifierCache,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const setOpenMock = jest.fn();
  const submitMock = jest.fn();

  test("Renders content ", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierSelectorModal
          open={true}
          setOpen={setOpenMock}
          onSubmit={submitMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(
      getByText(EN_TRANSLATIONS.connections.tab.indentifierselector.title)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.connections.tab.indentifierselector.message)
    ).toBeVisible();

    expect(getByTestId(`card-item-${identifierCache[2].id}`)).toBeVisible();

    expect(getByTestId("primary-button")).toBeVisible();

    expect(getByTestId("primary-button")).toBeDisabled();
  });

  test("Click to confirm button", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierSelectorModal
          open={true}
          setOpen={setOpenMock}
          onSubmit={submitMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(
      getByTestId("identifier-select-" + identifierCache[2].id)
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByTestId("identifier-select-" + identifierCache[2].id)
      );
    });

    await waitFor(() => {
      expect(getByTestId("primary-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button"));
    });

    await waitFor(() => {
      expect(submitMock).toBeCalled();
    });
  });
});
