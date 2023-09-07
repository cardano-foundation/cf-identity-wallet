import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { keriFix } from "../../__fixtures__/identityFix";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { filteredKeriFix } from "../../__fixtures__/filteredIdentityFix";
import { DidCardDetails } from "../../pages/DidCardDetails";
import { AriesAgent } from "../../../core/aries/ariesAgent";

const path = TabsRoutePath.DIDS + "/" + filteredKeriFix[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: filteredKeriFix[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      getIdentity: jest
        .fn()
        .mockResolvedValue({ type: "keri", result: filteredKeriFix[0] }),
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
    identities: filteredKeriFix,
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Cards Details page", () => {
  test("It renders Keri Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={DidCardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(getByText(filteredKeriFix[0].id)).toBeInTheDocument()
    );
    expect(getByTestId("share-identity-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getByTestId("edit-identity-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );
    expect(AriesAgent.agent.getIdentity).toBeCalledWith(filteredKeriFix[0].id);
  });
});
