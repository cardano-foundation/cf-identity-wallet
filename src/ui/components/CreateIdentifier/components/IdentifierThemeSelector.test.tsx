import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { IdentifierStage1 } from "./IdentifierStage1";
import { IdentifierStage3 } from "./IdentifierStage3";
import { filteredDidFix } from "../../../__fixtures__/filteredIdentifierFix";

describe("Identifier Theme Selector", () => {
  test("It switches did:key from theme 0 to theme 1", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        identifierType={0}
        selectedTheme={0}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identifier-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identifier-theme-selector-item-1"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(1);
    });
  });

  test("It switches KERI card from theme 4 to theme 5", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        identifierType={1}
        selectedTheme={4}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identifier-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identifier-theme-selector-item-4"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(4);
    });
  });
});

describe("Render Identifier Stage", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: ["/"],
      authentication: {
        loggedIn: true,
        userName: "Test",
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    connectionsCache: {
      connections: [
        {
          ...connectionsFix[5],
          logo: "",
        },
      ],
    },
    identifiersCache: {
      identifiers: filteredDidFix,
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Fallback connection logo for identifier stage 1", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage1
          state={{
            identifierCreationStage: 1,
            displayNameValue: "Duke",
            selectedIdentifierType: 1,
            selectedAidType: 1,
            selectedTheme: 1,
            threshold: 1,
            selectedConnections: [],
          }}
          resetModal={jest.fn()}
          setState={jest.fn()}
          componentId="11"
        />
      </Provider>
    );

    expect(getByTestId("identifier-stage-1-logo").getAttribute("src")).not.toBe(
      undefined
    );
  });

  test("Fallback connection logo identifier stage 3", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage3
          state={{
            identifierCreationStage: 1,
            displayNameValue: "Duke",
            selectedIdentifierType: 1,
            selectedAidType: 1,
            selectedTheme: 1,
            threshold: 1,
            selectedConnections: [
              {
                ...connectionsFix[5],
                logo: "",
              },
            ],
          }}
          resetModal={jest.fn()}
          setState={jest.fn()}
          componentId="11"
        />
      </Provider>
    );

    expect(
      getByTestId("identifier-stage-3-connection-logo-0").getAttribute("src")
    ).not.toBe(undefined);
  });
});
