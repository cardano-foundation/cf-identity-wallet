import { IonInput, IonLabel } from "@ionic/react";
import { ionFireEvent, waitForIonicReact } from "@ionic/react-test-utils";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { setAuthentication } from "../../../../../store/reducers/stateCache";
import { CustomInputProps } from "../../../../components/CustomInput/CustomInput.types";
import { Menu } from "../../Menu";
import { SubMenuKey } from "../../Menu.types";
import { PROFILE_LINK } from "../../../../globals/constants";

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: jest.fn(() => Promise.resolve()),
      },
    },
  },
}));

jest.mock("../../../../../core/storage", () => ({
  ...jest.requireActual("../../../../../core/storage"),
  SecureStorage: {
    get: () => {
      return "Frank";
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

jest.mock("../../../../components/CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <>
        <IonLabel
          position="stacked"
          data-testid={`${props.title
            ?.toLowerCase()
            .replace(/\s/g, "-")}-input-title`}
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
          onIonFocus={() => props.onChangeFocus?.(true)}
          onIonBlur={() => props.onChangeFocus?.(false)}
        />
      </>
    );
  },
}));

const browserMock = jest.fn(({ link }: { link: string }) =>
  Promise.resolve(link)
);
jest.mock("@capacitor/browser", () => ({
  ...jest.requireActual("@capacitor/browser"),
  Browser: {
    open: (params: never) => browserMock(params),
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialState = {
  stateCache: {
    routes: ["/"],
    authentication: {
      loggedIn: true,
      time: 1,
      passcodeIsSet: true,
      userName: "Frank",
      seedPhraseIsSet: false,
      passwordIsSet: false,
      passwordIsSkipped: false,
      ssiAgentIsSet: true,
      recoveryWalletProgress: false,
      loginAttempt: {
        attempts: 0,
        lockedUntil: 0,
      },
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
      ionFireEvent.ionInput(getByTestId("profile-item-edit-name"), "Carl");
    });

    act(() => {
      fireEvent.click(actionButton);
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setAuthentication({
          loggedIn: true,
          time: 1,
          passcodeIsSet: true,
          userName: "Carl",
          seedPhraseIsSet: false,
          passwordIsSet: false,
          passwordIsSkipped: false,
          ssiAgentIsSet: true,
          recoveryWalletProgress: false,
          loginAttempt: {
            attempts: 0,
            lockedUntil: 0,
          },
        })
      );
    });
  });

  test("Open Profile link", async () => {
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

    const profileLink = getByTestId("profile-item-profile-link");

    act(() => {
      fireEvent.click(profileLink);
    });

    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: PROFILE_LINK,
      });
    });
  });
});
