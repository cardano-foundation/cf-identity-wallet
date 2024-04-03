import { fireEvent, render, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { TabsRoutePath } from "../../../routes/paths";
import { ArchivedCredentials } from "./ArchivedCredentials";
import { credsFixW3c } from "../../__fixtures__/credsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setCredsCache } from "../../../store/reducers/credsCache";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      genericRecords: {
        findById: jest.fn(),
      },
      credentials: {
        restoreCredential: jest.fn((id: string) => Promise.resolve(id)),
      },
    },
  },
}));

const initialStateEmpty = {
  stateCache: {
    routes: [TabsRoutePath.CREDS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: [],
  },
};

let mockedStore: Store<unknown, AnyAction>;
describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStore = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
  });

  test("Render archived credentials", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <ArchivedCredentials
          archivedCredentialsIsOpen={true}
          archivedCreds={credsFixW3c}
          setArchivedCredentialsIsOpen={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("action-button")).toBeVisible();
    });

    credsFixW3c.forEach((cred) => {
      expect(
        getByText(
          cred.credentialType
            .replace(/([A-Z][a-z])/g, " $1")
            .replace(/(\d)/g, " $1")
            .trim()
        )
      ).toBeVisible();
    });

    expect(getByTestId("action-button").children.item(0)?.innerHTML).toBe(
      "Select"
    );
  });

  test.skip("Restore archived credentials", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <ArchivedCredentials
          archivedCredentialsIsOpen={true}
          archivedCreds={credsFixW3c}
          setArchivedCredentialsIsOpen={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("action-button")).toBeVisible();
    });

    const actionBtn = getByText("Select");
    act(() => {
      actionBtn.click();
    });

    await waitFor(() => {
      expect(getByTestId("action-button").children.item(0)?.innerHTML).toBe(
        "Cancel"
      );
    });

    await waitFor(() => {
      expect(getByText("0 Credentials Selected")).toBeVisible();
    });

    const cardItem = getByTestId(`crendential-card-item-${credsFixW3c[0].id}`);
    fireEvent.click(cardItem);

    const cardItem1 = getByTestId(`crendential-card-item-${credsFixW3c[1].id}`);
    fireEvent.click(cardItem1);

    const cardItem2 = getByTestId(`crendential-card-item-${credsFixW3c[2].id}`);
    fireEvent.click(cardItem2);

    await waitFor(() => {
      expect(
        getByText(`${credsFixW3c.length} Credentials Selected`)
      ).toBeVisible();
    });

    fireEvent.click(getByTestId("restore-credentials"));

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.creds.card.details.alert.restore.confirm)
      ).toBeVisible();
    });

    fireEvent.click(
      getByText(EN_TRANSLATIONS.creds.card.details.alert.restore.confirm)
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setCredsCache([...credsFixW3c]));
    });
  });
});
