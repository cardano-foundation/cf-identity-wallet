import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { waitForIonicReact } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { Profile } from "./Profile";
import { Agent } from "../../../../../core/agent/agent";
import { SubMenuKey } from "../../Menu.types";
import { Menu } from "../../Menu";
import { MiscRecordId } from "../../../../../core/agent/agent.types";

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
      },
    },
  },
}));

jest.mock("../../../../../core/storage", () => ({
  ...jest.requireActual("../../../../../core/storage"),
  SecureStorage: {
    get: (key: string) => {
      return "Frank";
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const mockDispatch = jest.fn();
const mockGetAuthentication = jest.fn();
const mockSetAuthentication = jest.fn();
const initialState = {
  stateCache: {
    routes: ["/"],
    authentication: {
      loggedIn: true,
      userName: "Frank",
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Profile page", () => {
  test("Change username", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.profile.title)
    ).toBeInTheDocument();
    const profileButton = getByTestId(`menu-input-item-${SubMenuKey.Profile}`);

    act(() => {
      fireEvent.click(profileButton);
    });

    await waitForIonicReact();

    const actionButton = getByTestId("action-button");

    expect(getByTestId("profile-title")).toHaveTextContent(
      EN_TRANSLATIONS.menu.tab.items.profile.tabheader
    );
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.profile.actionedit)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.profile.name)
    ).toBeInTheDocument();
    expect(actionButton).toHaveTextContent(
      EN_TRANSLATIONS.menu.tab.items.profile.actionedit
    );
    expect(getByTestId("profile-item-view-name")).toHaveTextContent(
      EN_TRANSLATIONS.menu.tab.items.profile.name + "Frank"
    );

    act(() => {
      fireEvent.click(actionButton);
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getByTestId("edit-profile-title")).toHaveTextContent(
        EN_TRANSLATIONS.menu.tab.items.profile.tabedit
      );
      expect(actionButton).toHaveTextContent(
        EN_TRANSLATIONS.menu.tab.items.profile.actionconfirm
      );
      expect(getByTestId("name-input-title")).toHaveTextContent(
        EN_TRANSLATIONS.menu.tab.items.profile.name
      );
    });

    act(() => {
      fireEvent.change(getByTestId("profile-item-edit-name"), {
        target: { value: "Carl" },
      });
    });

    act(() => {
      fireEvent.click(actionButton);
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        mockSetAuthentication({
          ...mockGetAuthentication(),
          userName: "Carl",
        })
      );
    });

    await waitFor(() => {
      const mockSave = jest.fn();
      Agent.agent.basicStorage.save = mockSave;
      expect(mockSave).toHaveBeenCalledWith(MiscRecordId.USER_NAME, {
        userName: "Carl",
      });
    });

    await waitFor(() => {
      expect(getByTestId("profile-item-view-name")).toHaveTextContent(
        EN_TRANSLATIONS.menu.tab.items.profile.name + "Carl"
      );
    });
  });
});
