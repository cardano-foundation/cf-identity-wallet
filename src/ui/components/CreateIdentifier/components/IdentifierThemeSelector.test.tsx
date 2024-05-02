import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { IdentifierStage1 } from "./IdentifierStage1";
import { IdentifierStage3 } from "./IdentifierStage3";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";

describe("Identifier Theme Selector", () => {
  test("It switches KERI card from theme 0 to theme 1", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        selectedTheme={0}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identifier-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identifier-theme-selector-item-0"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(0);
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
      identifiers: filteredIdentifierFix,
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
            selectedAidType: 1,
            selectedTheme: 1,
            threshold: 1,
            scannedConections: [],
            selectedConnections: [],
            ourIdentifier: "",
            newIdentifier: {
              id: "",
              displayName: "",
              createdAtUTC: "",
              theme: 0,
              isPending: false,
              signifyName: "",
            },
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
            selectedAidType: 1,
            selectedTheme: 1,
            threshold: 1,
            scannedConections: [],
            selectedConnections: [
              {
                ...connectionsFix[5],
                logo: "",
              },
            ],
            ourIdentifier: "",
            newIdentifier: {
              id: "",
              displayName: "",
              createdAtUTC: "",
              theme: 0,
              isPending: false,
              signifyName: "",
            },
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
