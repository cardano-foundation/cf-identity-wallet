import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { CreateIdentifier } from "./CreateIdentifier";
import { TabsRoutePath } from "../navigation/TabsMenu";
setupIonicReact();
mockIonicReact();

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
  ),
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
  },
}));

describe("Create Identifier modal", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
    },
    identifiersCache: {
      identifiers: [],
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("It can dismiss the modal", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          resumeMultiSig={null}
        />
      </Provider>
    );
    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });
    expect(getByTestId("create-identifier-modal-content-page")).toHaveClass(
      "ion-hide"
    );
  });

  test("It shows the spinner and closes the modal when creating a new Default identifier", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CreateIdentifier
          modalIsOpen={true}
          setModalIsOpen={jest.fn()}
          resumeMultiSig={null}
        />
      </Provider>
    );
    const displayNameInput = getByTestId("display-name-input");
    act(() => {
      fireEvent.change(displayNameInput, { target: { value: "Test" } });
    });
    act(() => {
      fireEvent.click(getByTestId("primary-button-create-identifier-modal"));
    });
    expect(getByTestId("spinner-container")).toBeVisible();
    expect(getByTestId("create-identifier-modal-content-page")).toHaveClass(
      "ion-hide"
    );
  });
});
