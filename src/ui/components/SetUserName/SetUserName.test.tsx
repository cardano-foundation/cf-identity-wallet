import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { SetUserName } from "./SetUserName";
import { ToastMsgType } from "../../globals/types";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { Agent } from "../../../core/agent/agent";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
      },
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

describe("SetUserName component", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: ["/"],
      authentication: {
        loggedIn: true,
        userName: "",
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    connectionsCache: {
      connections: connectionsFix,
    },
    identifiersCache: {
      identifiers: filteredIdentifierFix,
      favourites: [],
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It renders modal successfully", async () => {
    const showSetUserName = true;
    const setShowSetUserName = jest.fn();
    const { getByText } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={showSetUserName}
          setIsOpen={setShowSetUserName}
        />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.setusername.title)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.setusername.button.confirm)).toBeVisible();
  });

  test.skip("It should call handleConfirm when the primary button is clicked", async () => {
    const setIsOpenMock = jest.fn();
    const mockDispatch = jest.fn();
    const mockGetAuthentication = jest.fn();
    const mockSetAuthentication = jest.fn();
    const mockSetToastMsg = jest.fn();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={true}
          setIsOpen={setIsOpenMock}
        />
      </Provider>
    );

    act(() => {
      fireEvent.change(getByTestId("set-user-name-input"), {
        target: { value: "testUser" },
      });
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.setusername.button.confirm));
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        mockSetAuthentication({
          ...mockGetAuthentication(),
          userName: "testUser",
        })
      );
    });

    await waitFor(() => {
      const mockSave = jest.fn();
      Agent.agent.basicStorage.save = mockSave;
      expect(mockSave).toHaveBeenCalledWith(MiscRecordId.APP_USER_NAME, {
        userName: "testUser",
      });
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        mockSetToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS)
      );
    });

    await waitFor(() => {
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });
  });
});
