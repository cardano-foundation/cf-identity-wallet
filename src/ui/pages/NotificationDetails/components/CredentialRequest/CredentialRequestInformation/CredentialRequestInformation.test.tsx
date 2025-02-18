import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../../__fixtures__/connectionsFix";
import { credRequestFix } from "../../../../../__fixtures__/credRequestFix";
import { notificationsFix } from "../../../../../__fixtures__/notificationsFix";
import { passcodeFiller } from "../../../../../utils/passcodeFiller";
import { CredentialRequestInformation } from "./CredentialRequestInformation";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
}));

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const joinMultisigOfferMock = jest.fn();

jest.mock("../../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      keriaNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      ipexCommunications: {
        joinMultisigOffer: () => joinMultisigOfferMock(),
        getOfferedCredentialSaid: jest.fn(() => "cred-id"),
      },
      auth: {
        verifySecret: jest.fn().mockResolvedValue(true),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialState = {
  stateCache: {
    routes: [TabsRoutePath.NOTIFICATIONS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
};

describe("Credential request information", () => {
  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={jest.fn()}
          onAccept={jest.fn()}
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={null}
          onReloadData={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.alert.textdecline
        )
      ).toBeVisible();
    });

    fireEvent.click(
      getByTestId("multisig-request-alert-decline-confirm-button")
    );

    await waitFor(() => {
      expect(deleteNotificationMock).toBeCalled();
      expect(
        queryByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.alert.textdecline
        )
      ).toBeNull();
    });
  });
});

describe("Credential request information: multisig", () => {
  const linkedGroup = {
    linkedRequest: {
      accepted: false,
      current: "",
      previous: undefined,
    },
    threshold: "5",
    members: ["member-1", "member-2"],
    othersJoined: [],
    memberInfos: [
      {
        aid: "member-1",
        name: "Member 1",
        joined: false,
      },
      {
        aid: "member-2",
        name: "Member 2",
        joined: false,
      },
    ],
  };

  test("Initiator open cred", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const accept = jest.fn();

    const { getByText, getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={jest.fn()}
          onAccept={accept}
          userAID="member-1"
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={linkedGroup}
          onReloadData={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.initiatorselectcred
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.threshold
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.groupmember
      )
    ).toBeVisible();
    expect(
      queryByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.proposalfrom
      )
    ).toBeNull();
    expect(
      queryByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.proposedcred
      )
    ).toBeNull();
    expect(
      queryByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.accept)
    ).toBeNull();
    expect(
      queryByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.reject)
    ).toBeNull();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.buttons.choosecredential
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    expect(accept).toBeCalled();
  });

  test("Initiator chosen cred", async () => {
    const linkedGroup = {
      linkedRequest: {
        accepted: true,
        current: "cred-id",
        previous: undefined,
      },
      threshold: "5",
      members: ["member-1", "member-2"],
      othersJoined: ["member-1"],
      memberInfos: [
        {
          aid: "member-1",
          name: "Member 1",
          joined: true,
        },
        {
          aid: "member-2",
          name: "Member 2",
          joined: false,
        },
      ],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const back = jest.fn();

    const { getByText, getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={back}
          onAccept={jest.fn()}
          userAID="member-1"
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={linkedGroup}
          onReloadData={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.initiatorselectedcred
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.threshold
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.groupmember
      )
    ).toBeVisible();
    expect(
      queryByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.proposalfrom
      )
    ).toBeNull();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.proposedcred
      )
    ).toBeVisible();
    expect(
      queryByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.accept)
    ).toBeNull();
    expect(
      queryByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.reject)
    ).toBeNull();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.ok)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    expect(back).toBeCalled();
  });

  test("Member open cred", async () => {
    const linkedGroup = {
      linkedRequest: {
        accepted: false,
        current: "cred-id",
        previous: undefined,
      },
      threshold: "5",
      members: ["member-1", "member-2"],
      othersJoined: [],
      memberInfos: [
        {
          aid: "member-1",
          name: "Member 1",
          joined: false,
        },
        {
          aid: "member-2",
          name: "Member 2",
          joined: false,
        },
      ],
    };

    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        isOnline: true,
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const back = jest.fn();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={back}
          onAccept={jest.fn()}
          userAID="member-2"
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={linkedGroup}
          onReloadData={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.memberwaitingproposal
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.threshold
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.groupmember
      )
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.ok)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    expect(back).toBeCalled();
  });

  test("Member open cred after initiator chosen cred", async () => {
    const linkedGroup = {
      linkedRequest: {
        accepted: true,
        current: "cred-id",
        previous: undefined,
      },
      threshold: "5",
      members: ["member-1", "member-2"],
      othersJoined: ["member-1"],
      memberInfos: [
        {
          aid: "member-1",
          name: "Member 1",
          joined: true,
        },
        {
          aid: "member-2",
          name: "Member 2",
          joined: false,
        },
      ],
    };

    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        isOnline: true,
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const back = jest.fn();

    const { getByText, getByTestId, getAllByText, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={back}
          onAccept={jest.fn()}
          userAID="member-2"
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={linkedGroup}
          onReloadData={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getAllByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.proposedcred
        ).length
      ).toBeGreaterThan(1);
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.memberreviewcred
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.threshold
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.groupmember
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.proposalfrom
      )
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.accept)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.reject)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(joinMultisigOfferMock).toBeCalled();
    });

    act(() => {
      fireEvent.click(getByTestId("delete-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getAllByTestId("multisig-request-alert-decline")[0]
      ).toHaveTextContent(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.alert.textdecline
      );
    });

    act(() => {
      fireEvent.click(
        getByTestId("multisig-request-alert-decline-confirm-button")
      );
    });

    await waitFor(() => {
      expect(deleteNotificationMock).toBeCalled();
    });
  });
});
