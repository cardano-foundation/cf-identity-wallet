import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { credsFix } from "../../__fixtures__/credsFix";
import { CredCardDetails } from "../../pages/CredCardDetails";
import { AriesAgent } from "../../../core/agent/agent";

const path = TabsRoutePath.CREDS + "/" + credsFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
    },
  },
}));

const initialStateNoPassword = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: false,
      passwordIsSkipped: true,
    },
  },
  seedPhraseCache: {
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
};

const initialStateWithPassword = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
      passwordIsSkipped: false,
    },
  },
  seedPhraseCache: {
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
};

describe("Verify Password on Cards Details page", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  test("It renders verify password when clicking on the big archive button", async () => {
    jest
      .spyOn(AriesAgent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFix[0]);
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };
    const { findByTestId, getByText, getAllByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    const archiveButton = await findByTestId("card-details-archive-button");

    act(() => {
      fireEvent.click(archiveButton);
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.creds.card.details.alert.archive.title)
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "false"
      );
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.creds.card.details.alert.archive.confirm)
      );
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });

  test.skip("It asks to verify the password when users try to archive the cred using the button in the modal", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };
    const { getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getAllByTestId("verify-password")[1].getAttribute("is-open")).toBe(
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
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });
});
