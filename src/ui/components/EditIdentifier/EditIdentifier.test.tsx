import { ionFireEvent, waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IonInput, IonLabel } from "@ionic/react";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { EditIdentifier } from "./EditIdentifier";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { IdentifierService } from "../../../core/agent/services";

const updateMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        updateIdentifier: () => updateMock(() => Promise.resolve(true)),
      },
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

const isNativeMock = jest.fn();
jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => isNativeMock(),
    },
  };
});

const addEventMock = jest.fn();
const removeAllListenerMock = jest.fn();
jest.mock("@capacitor/keyboard", () => {
  return {
    ...jest.requireActual("@capacitor/keyboard"),
    Keyboard: {
      addListener: (params: unknown) => addEventMock(params),
      removeAllListeners: () => removeAllListenerMock(),
    },
  };
});

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
        />
      </>
    );
  },
}));

describe("Edit identifier", () => {
  const dispatchMock = jest.fn();
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    isNativeMock.mockImplementation(() => false);
    updateMock.mockImplementation(() => Promise.resolve(true));
  });
  beforeAll(() => {
    const mockStore = configureStore();
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
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Register keyboard event when render app", async () => {
    isNativeMock.mockImplementation(() => true);

    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();
    const { unmount } = render(
      <Provider store={mockedStore}>
        <EditIdentifier
          modalIsOpen={true}
          setModalIsOpen={setIdentifierOptionsIsOpen}
          setCardData={setCardData}
          cardData={identifierFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(addEventMock).toBeCalled();
    });

    unmount();

    await waitFor(() => {
      expect(removeAllListenerMock).toBeCalled();
    });
  });

  test("render", async () => {
    const setIdentifierOptionsIsOpen = jest.fn();
    const setCardData = jest.fn();

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <EditIdentifier
          modalIsOpen={true}
          setModalIsOpen={setIdentifierOptionsIsOpen}
          setCardData={setCardData}
          cardData={identifierFix[0]}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByTestId("edit-name-input")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-theme-selector-item-1"));
    });

    await waitFor(() => {
      expect(
        getByTestId("primary-button-edit-identifier").getAttribute("disabled")
      ).toBe("false");
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-edit-identifier"));
    });

    await waitFor(() => {
      expect(updateMock).toBeCalledTimes(1);
    });
  });


  test("Display error when display name invalid", async () => {
    updateMock.mockImplementation(() => {
      throw new Error(IdentifierService.IDENTIFIER_NAME_TAKEN)
    })

    const { getByTestId, getByText, queryByTestId } = render(
      <Provider store={mockedStore}>
        <EditIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          setCardData={jest.fn()}
          cardData={identifierFix[0]}
        />
      </Provider>
    );

    act(() => {
      ionFireEvent.ionInput(getByTestId("edit-name-input"), "");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.onlyspace)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("edit-name-input"), "   ");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.onlyspace)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("edit-name-input"), "Duke Duke Duke Duke  Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke Duke");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.maxlength)
      ).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("edit-name-input"), "Duke@@");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.hasspecialchar)
      ).toBeVisible();
    });
    
    act(() => {
      ionFireEvent.ionInput(getByTestId("edit-name-input"), "Duke");
    });

    await waitFor(() => {
      expect(queryByTestId("error-message")).toBe(null);
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-edit-identifier"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.nameerror.duplicatename)
      ).toBeVisible();
    });
  });
});
