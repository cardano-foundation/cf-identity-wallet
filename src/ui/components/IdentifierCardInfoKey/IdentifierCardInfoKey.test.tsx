import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { didFix, identifierFix } from "../../__fixtures__/identifierFix";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { filteredDidFix } from "../../__fixtures__/filteredIdentifierFix";
import { IdentifierCardDetails } from "../../pages/IdentifierCardDetails";
import { AriesAgent } from "../../../core/agent/agent";

const path = TabsRoutePath.IDENTIFIERS + "/" + identifierFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identifierFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      identifiers: {
        getIdentifier: jest
          .fn()
          .mockResolvedValue({ type: "key", result: identifierFix[0] }),
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
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
  identitiesCache: {
    identities: filteredDidFix,
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
  test("It renders Did:Key Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredDidFix[0].id.substring(8, 13) +
            "..." +
            filteredDidFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    expect(getByTestId("share-identifier-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(
      getByTestId("identifier-options-modal").getAttribute("is-open")
    ).toBe("false");
    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );
    expect(AriesAgent.agent.identifiers.getIdentifier).toBeCalledWith(
      filteredDidFix[0].id
    );
  });
  test("It copies id to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked2}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          filteredDidFix[0].id.substring(8, 13) +
            "..." +
            filteredDidFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    fireEvent.click(getByTestId("copy-button-id"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: filteredDidFix[0].id,
      });
    });
  });

  test("It copies type to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          didFix[0].id.substring(8, 13) + "..." + didFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    fireEvent.click(getByTestId("copy-button-type"));
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didFix[0].keyType,
      });
    });
  });

  test("It copies controller to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          didFix[0].id.substring(8, 13) + "..." + didFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    fireEvent.click(getByTestId("copy-button-controller"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didFix[0].controller,
      });
    });
  });

  test("It copies publicKeyBase58 to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={IdentifierCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(
        getByText(
          didFix[0].id.substring(8, 13) + "..." + didFix[0].id.slice(-5)
        )
      ).toBeInTheDocument()
    );
    fireEvent.click(getByTestId("copy-button-publicKeyBase58"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didFix[0].publicKeyBase58,
      });
    });
  });
});
