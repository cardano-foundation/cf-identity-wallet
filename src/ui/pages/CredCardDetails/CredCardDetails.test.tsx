import {
  act,
  fireEvent,
  render,
  waitFor,
  screen,
} from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { CredCardDetails } from "./CredCardDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { credsFix } from "../../__fixtures__/credsFix";
import { AriesAgent } from "../../../core/agent/agent";

const path = TabsRoutePath.CREDS + "/" + credsFix[0].id;

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
    },
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
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

describe("Cards Details page", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeAll(() => {
    jest
      .spyOn(AriesAgent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFix[0]);
  });
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  test("It renders Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => {
      expect(getByText(credsFix[0].credentialType)).toBeInTheDocument();
      expect(getByTestId("creds-options-modal").getAttribute("is-open")).toBe(
        "false"
      );
      expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
        "false"
      );
      expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
        "false"
      );
    });
  });

  test("It copies id to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { findByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );
    const copyButton = await findByTestId("copy-button-proof-value");
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: credsFix[0].proofValue,
      });
    });
  });

  test("It opens the options modal", async () => {
    const { findByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    const credsOptionsModal = await findByTestId("creds-options-modal");
    expect(credsOptionsModal.getAttribute("is-open")).toBe("false");
    const optionsButton = await findByTestId("options-button");
    act(() => {
      fireEvent.click(optionsButton);
    });

    const credsOptionsModalOpen = await findByTestId("creds-options-modal");
    expect(credsOptionsModalOpen.getAttribute("is-open")).toBe("true");
  });

  test.skip("It shows the credential viewer", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-view-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-view-button"));
    });

    await waitFor(() => {
      expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
        "true"
      );
    });

    await waitFor(() => {
      expect(getByText(credsFix[0].id)).toBeVisible();
    });
  });

  test("It shows the warning when I click on the big delete button", async () => {
    const { findByTestId, findByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );
    const deleteButton = await findByTestId("card-details-delete-button");
    act(() => {
      fireEvent.click(deleteButton);
    });

    const deleteAlert = await findByText(
      EN_TRANSLATIONS.creds.card.details.delete.alert.title
    );
    await waitFor(() => {
      expect(deleteAlert).toBeVisible();
    });
  });
});
