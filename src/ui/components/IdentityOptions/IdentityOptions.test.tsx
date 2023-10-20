import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { identityFix } from "../../__fixtures__/identityFix";
import { filteredIdentityFix } from "../../__fixtures__/filteredIdentityFix";
import { IdentityOptions } from "./IdentityOptions";
import { TabsRoutePath } from "../navigation/TabsMenu";

jest.mock("../../../core/agent/agent");

describe("Identity Options modal", () => {
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
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
      didsCache: {
        dids: filteredIdentityFix,
      },
      identitiesCache: {
        identities: [identityFix[0]],
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("should display the modal", () => {
    const setIdentityOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentityOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentityOptionsIsOpen}
          cardData={identityFix[0]}
          setCardData={setCardData}
        />
      </Provider>
    );
    expect(getByTestId("identity-options-modal")).toBeInTheDocument();
  });

  test.skip("should display the elements inside the modal", () => {
    const setIdentityOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentityOptions
          optionsIsOpen={true}
          setOptionsIsOpen={setIdentityOptionsIsOpen}
          cardData={identityFix[0]}
          setCardData={setCardData}
        />
      </Provider>
    );

    expect(getByTestId("identity-options-view-button")).toBeInTheDocument();
    expect(
      getByTestId("identity-options-identity-options-button")
    ).toBeInTheDocument();
    expect(getByTestId("identity-options-share-button")).toBeInTheDocument();
    expect(getByTestId("identity-options-delete-button")).toBeInTheDocument();
  });
});
