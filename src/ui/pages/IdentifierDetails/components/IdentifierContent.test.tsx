import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { identifierFix } from "../../../__fixtures__/identifierFix";
import { TabsRoutePath } from "../../../components/navigation/TabsMenu";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { IdentifierDetails } from "..";
import { Agent } from "../../../../core/agent/agent";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { ConfigurationService } from "../../../../core/configuration";

const path = TabsRoutePath.IDENTIFIERS + "/" + identifierFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identifierFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue(identifierFix[0]),
      },
      connections: {
        getOobi: jest.fn(),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
    },
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

const storeMocked2 = {
  ...mockStore({ ...initialState }),
  dispatch: jest.fn(),
};

describe("Cards Details page", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("It renders Identifier Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredIdentifierFix[0].id.substring(0, 5) +
            "..." +
            filteredIdentifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    expect(getByText(filteredIdentifierFix[0].displayName)).toBeInTheDocument();
    expect(getByTestId("share-identifier-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(
      getByTestId("identifier-options-modal").getAttribute("is-open")
    ).toBe("false");
    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );
    expect(Agent.agent.identifiers.getIdentifier).toBeCalledWith(
      filteredIdentifierFix[0].id
    );
  });

  test("It copies delegator identifier, signing key, next key digest, backer address to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByTestId("delegator")).toBeInTheDocument());

    fireEvent.click(getByTestId("delegator-copy-button"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: identifierFix[0].di,
      });
    });

    fireEvent.click(getByTestId("signing-key-0-copy-button"));
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: identifierFix[0].k[0],
      });
    });

    fireEvent.click(getByTestId("next-key-0-copy-button"));
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: identifierFix[0].n[0],
      });
    });
  });

  test("It shows: Keys Signing Threshold - Next Keys Signing Threshold - Creation Timestamp - Last Key Rotation Timestamp - Sequence Number", async () => {
    const { getByText } = render(
      <Provider store={storeMocked2}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          identifierFix[0].id.substring(0, 5) +
            "..." +
            identifierFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(getByText(identifierFix[0].kt)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(getByText(identifierFix[0].nt)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        getByText(
          formatShortDate(identifierFix[0].createdAtUTC) +
            " - " +
            formatTimeToSec(identifierFix[0].createdAtUTC)
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        getByText(
          formatShortDate(identifierFix[0].dt) +
            " - " +
            formatTimeToSec(identifierFix[0].dt)
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(getByText(identifierFix[0].s)).toBeInTheDocument()
    );
  });
});
