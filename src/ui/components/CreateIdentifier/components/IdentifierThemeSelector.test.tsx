import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { IdentifierStage4 } from "./IdentifierStage4";
import { IdentifierStage2 } from "./IdentifierStage2";
import { IdentifierColor } from "./IdentifierColorSelector";

describe("Identifier Theme Selector", () => {
  test("It switches KERI card from theme 0 to theme 1", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        color={IdentifierColor.Green}
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

  test("Fallback connection logo for identifier stage 2", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage2
          state={{
            identifierCreationStage: 1,
            displayNameValue: "Duke",
            selectedAidType: 1,
            selectedTheme: 1,
            threshold: 1,
            scannedConections: [
              {
                ...connectionsFix[5],
                logo: "",
              },
            ],
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
            color: IdentifierColor.Green,
          }}
          resetModal={jest.fn()}
          setState={jest.fn()}
          componentId="create-identifier-modal"
        />
      </Provider>
    );

    expect(getByTestId("identifier-stage-2-logo").getAttribute("src")).not.toBe(
      undefined
    );
  });

  test("Fallback connection logo identifier stage 4", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <IdentifierStage4
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
            color: IdentifierColor.Green,
          }}
          resetModal={jest.fn()}
          setState={jest.fn()}
          componentId="create-identifier-modal"
        />
      </Provider>
    );

    expect(
      getByTestId("identifier-stage-3-connection-logo-0").getAttribute("src")
    ).not.toBe(undefined);
  });
});
