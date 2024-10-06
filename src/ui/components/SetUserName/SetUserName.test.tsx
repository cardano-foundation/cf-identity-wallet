import { IonInput, IonLabel } from "@ionic/react";
import { ionFireEvent } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  setAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { ToastMsgType } from "../../globals/types";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { SetUserName } from "./SetUserName";
import { Agent } from "../../../core/agent/agent";
import { BasicRecord } from "../../../core/agent/records";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: jest.fn(() => {
          return Promise.resolve(true);
        }),
      },
    },
  },
}));

jest.mock("../CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <>
        <IonLabel
          position="stacked"
          data-testid={`${props.title?.toLowerCase().replace(" ", "-")}-title`}
        >
          {props.title}
          {props.optional && (
            <span className="custom-input-optional">(optional)</span>
          )}
        </IonLabel>
        <IonInput
          data-testid={props.dataTestId}
          onIonInput={(e) => {
            props.onChangeInput(e.detail.value as string);
          }}
          value={props.value}
        />
      </>
    );
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
        time: 0,
        passcodeIsSet: true,
        seedPhraseIsSet: true,
        passwordIsSet: false,
        passwordIsSkipped: true,
        ssiAgentIsSet: true,
        recoveryWalletProgress: false,
        loginAttempt: {
          attempts: 0,
          lockedUntil: 0,
        },
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

  test("It should call handleConfirm when the primary button is clicked", async () => {
    const setIsOpenMock = jest.fn();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={true}
          setIsOpen={setIsOpenMock}
        />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionInput(getByTestId("set-user-name-input"), "testUser");
    });

    await waitFor(() => {
      expect(
        (getByTestId("set-user-name-input") as HTMLInputElement).value
      ).toBe("testUser");
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.setusername.button.confirm));
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setAuthentication({
          loggedIn: true,
          time: 0,
          passcodeIsSet: true,
          seedPhraseIsSet: true,
          passwordIsSet: false,
          passwordIsSkipped: true,
          ssiAgentIsSet: true,
          recoveryWalletProgress: false,
          loginAttempt: {
            attempts: 0,
            lockedUntil: 0,
          },
          userName: "testUser",
        })
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS)
      );
    });

    await waitFor(() => {
      expect(setIsOpenMock).toHaveBeenCalledWith(false);
    });
  });

  test("Display error message", async () => {
    const setIsOpenMock = jest.fn();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <SetUserName
          isOpen={true}
          setIsOpen={setIsOpenMock}
        />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionInput(getByTestId("set-user-name-input"), "testUser");
    });

    await waitFor(() => {
      expect(
        (getByTestId("set-user-name-input") as HTMLInputElement).value
      ).toBe("testUser");
    });

    jest
      .spyOn(Agent.agent.basicStorage, "createOrUpdateBasicRecord")
      .mockImplementation(() => {
        return Promise.reject("Error");
      });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.setusername.button.confirm));
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setToastMsg(ToastMsgType.USERNAME_CREATION_ERROR)
      );
    });
  });
});
