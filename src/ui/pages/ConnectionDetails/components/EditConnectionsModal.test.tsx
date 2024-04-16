import {
  mockIonicReact,
  ionFireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
mockIonicReact();
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { TabsRoutePath } from "../../../../routes/paths";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { filteredCredsFix } from "../../../__fixtures__/filteredCredsFix";
import {
  EditConnectionsContainer,
  EditConnectionsModal,
} from "./EditConnectionsModal";
import { formatShortDate } from "../../../utils/formatters";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        createConnectionNote: jest.fn(),
        deleteConnectionNoteById: jest.fn(),
        updateConnectionNoteById: jest.fn(),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
};

const mockNow = 1466424490000;
let dateSpy: any;

describe("Edit Connection Modal", () => {
  beforeAll(() => {
    dateSpy = jest.spyOn(Date, "now").mockReturnValue(mockNow);
  });

  afterAll(() => {
    dateSpy.mockRestore();
  });

  test("Render edit connection modal: empty note", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <EditConnectionsModal
          onConfirm={jest.fn()}
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setNotes={jest.fn()}
          notes={[]}
          connectionDetails={connectionsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("connection-name").innerHTML).toBe(
        connectionsFix[0].label
      );
    });
    expect(getByTestId("data-connection-time").innerHTML).toBe(
      formatShortDate(connectionsFix[0].connectionDate)
    );
    expect(getByTestId("action-button")).toBeVisible();
    expect(getByTestId("close-button")).toBeVisible();
    expect(getByTestId("add-note-button")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.connections.details.nocurrentnotes)
    ).toBeVisible();
  });

  test("Render edit connection modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <EditConnectionsContainer
          onConfirm={jest.fn()}
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setNotes={jest.fn()}
          notes={[
            {
              id: "1",
              title: "Mock Note",
              message: "Mock Note",
            },
          ]}
          connectionDetails={connectionsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("connection-name").innerHTML).toBe(
        connectionsFix[0].label
      );
    });

    await waitFor(() => {
      const titleInput = getByTestId("edit-connections-modal-note-title-1");
      const messageInput = getByTestId("edit-connections-modal-note-message-1");

      expect(titleInput.querySelector("input")?.value).toBe("Mock Note");
      expect(messageInput.querySelector("textarea")?.value).toBe("Mock Note");
    });
  });

  test("Display delete note alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <EditConnectionsContainer
          onConfirm={jest.fn()}
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setNotes={jest.fn()}
          notes={[
            {
              id: "1",
              title: "Mock Note",
              message: "Mock Note",
            },
          ]}
          connectionDetails={connectionsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("connection-name").innerHTML).toBe(
        connectionsFix[0].label
      );
    });

    await waitFor(() => {
      const titleInput = getByTestId("edit-connections-modal-note-title-1");
      expect(titleInput.querySelector("input")?.value).toBe("Mock Note");
      expect(getByTestId("note-delete-button-1")).toBeVisible();
    });

    const deleteButton = getByTestId("note-delete-button-1");

    act(() => {
      ionFireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(getAllByTestId("alert-confirm-delete-note")[0]).toBeVisible();
    });
  });

  test("Add note", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <EditConnectionsContainer
          onConfirm={jest.fn()}
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setNotes={jest.fn()}
          notes={[]}
          connectionDetails={connectionsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("connection-name").innerHTML).toBe(
        connectionsFix[0].label
      );
    });

    act(() => {
      fireEvent.click(getByTestId("add-note-button"));
    });

    await waitFor(() => {
      expect(getAllByTestId("connection-note").length).toBeGreaterThan(0);
    });
  });

  test("Save process not working when user confirm empty data", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const confirmFn = jest.fn();

    const { getByTestId, getAllByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <EditConnectionsContainer
          onConfirm={confirmFn}
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setNotes={jest.fn()}
          notes={[]}
          connectionDetails={connectionsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("connection-name").innerHTML).toBe(
        connectionsFix[0].label
      );
      expect(getByTestId("action-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-note-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.details.notes)
      ).toBeVisible();
      expect(getAllByTestId("connection-note").length).toBe(1);
      expect(
        getByText(EN_TRANSLATIONS.connections.details.title)
      ).toBeVisible();
    });

    const actionBtn = getByTestId("action-button");

    act(() => {
      ionFireEvent.click(actionBtn);
    });

    expect(confirmFn).toBeCalledTimes(0);
  });
});
