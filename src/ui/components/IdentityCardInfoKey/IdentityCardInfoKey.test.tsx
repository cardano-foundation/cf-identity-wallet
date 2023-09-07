import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { didFix, identityFix } from "../../__fixtures__/identityFix";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { filteredDidFix } from "../../__fixtures__/filteredIdentityFix";
import { DidCardDetails } from "../../pages/DidCardDetails";

const path = TabsRoutePath.DIDS + "/" + identityFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: identityFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      getIdentity: jest
        .fn()
        .mockResolvedValue({ type: "key", result: identityFix[0] }),
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.DIDS],
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
  test("It copies id to clipboard", async () => {
    Clipboard.write = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked2}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(identityFix[0].id)).toBeInTheDocument()
    );
    fireEvent.click(getByTestId("copy-button-id"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: identityFix[0].id,
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
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didFix[0].id)).toBeInTheDocument());
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
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didFix[0].id)).toBeInTheDocument());
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
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(getByText(didFix[0].id)).toBeInTheDocument());
    fireEvent.click(getByTestId("copy-button-publicKeyBase58"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didFix[0].publicKeyBase58,
      });
    });
  });
});
