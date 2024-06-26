import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import { CredentialDetails } from "../../pages/CredentialDetails";
import { Agent } from "../../../core/agent/agent";
import { VerifyPasscode } from "./VerifyPasscode";

const path = TabsRoutePath.CREDENTIALS + "/" + credsFixAcdc[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFixAcdc[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
    },
  },
}));

const initialStateNoPassword = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: false,
      passwordIsSkipped: true,
    },
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  credsCache: { creds: credsFixAcdc },
  credsArchivedCache: { creds: credsFixAcdc },
  biometryCache: {
    enabled: false,
  },
};

describe("Verify Passcode on Cards Details page", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  test.skip("It asks to verify the passcode when users try to delete the cred using the button in the modal", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
    const { getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getAllByTestId("verify-passcode")[1].getAttribute("is-open")).toBe(
      "false"
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-archive-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-archive-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getAllByTestId("verify-passcode")[1]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });
  test("Render passcode", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };

    const closeFn = jest.fn();

    const { getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyPasscode
          isOpen={true}
          setIsOpen={closeFn}
          onVerify={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("close-button-label")).toBeInTheDocument();
    });
  });

  test("It renders verify passcode when clicking on the big button", async () => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixAcdc[0]);
    const { findByTestId, getAllByText, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    const archiveButton = await findByTestId(
      "archive-button-credential-card-details"
    );
    act(() => {
      fireEvent.click(archiveButton);
    });

    await waitFor(() => {
      expect(
        getAllByText(EN_TRANSLATIONS.credentials.details.alert.archive.title)[0]
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(getAllByTestId("verify-passcode")[0]).toHaveAttribute(
        "is-open",
        "false"
      );
    });

    act(() => {
      fireEvent.click(
        getAllByText(
          EN_TRANSLATIONS.credentials.details.alert.archive.confirm
        )[0]
      );
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getAllByTestId("verify-passcode")[0]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });
});
