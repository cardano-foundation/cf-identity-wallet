import { fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { act, useState } from "react";
import {
  BiometryError,
  BiometryErrorType,
  BiometryType,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth";
import { Provider } from "react-redux";
import { useBiometricAuth } from "./useBiometricsHook";
import { store } from "../../store";

const checkBiometry = jest.fn(
  (): Promise<CheckBiometryResult> =>
    Promise.resolve({
      isAvailable: true,
      strongBiometryIsAvailable: true,
      biometryType: BiometryType.faceId,
      biometryTypes: [],
      deviceIsSecure: true,
      reason: BiometryErrorType.none,
      code: BiometryErrorType.none,
      strongReason: undefined,
      strongCode: undefined,
    })
);

const authenticate = jest.fn(() => Promise.resolve(true));
const addResumeListener = jest.fn();

jest.mock("@aparajita/capacitor-biometric-auth", () => ({
  ...jest.requireActual("@aparajita/capacitor-biometric-auth"),
  BiometricAuth: {
    checkBiometry: () => checkBiometry(),
    authenticate: () => authenticate(),
    addResumeListener: () => addResumeListener(),
  },
}));

const TestComponent = () => {
  const { handleBiometricAuth } = useBiometricAuth();
  const [error, setError] = useState("");

  const callHandleBiometricAuth = async () => {
    const result = await handleBiometricAuth();
    if (result instanceof BiometryError) {
      setError(result.message);
    }
  };

  return (
    <div>
      <button
        data-testid="handle-biometric-btn"
        onClick={callHandleBiometricAuth}
      >
        Button
      </button>
      {error && <p data-testid="error-message">{error}</p>}
    </div>
  );
};

describe("Biometric hook", () => {
  beforeEach(() => {
    checkBiometry.mockImplementation(() =>
      Promise.resolve({
        isAvailable: true,
        strongBiometryIsAvailable: true,
        biometryType: BiometryType.faceId,
        biometryTypes: [],
        deviceIsSecure: true,
        reason: BiometryErrorType.none,
        code: BiometryErrorType.none,
        strongReason: undefined,
        strongCode: undefined,
      })
    );
  });

  test("normal", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("handle-biometric-btn"));
    });

    await waitFor(() => {
      expect(checkBiometry).toBeCalled();
      expect(authenticate).toBeCalled();
    });
  });

  test("Biometry not available", async () => {
    checkBiometry.mockImplementation(() =>
      Promise.resolve({
        isAvailable: false,
        strongBiometryIsAvailable: true,
        biometryType: BiometryType.faceId,
        biometryTypes: [],
        deviceIsSecure: true,
        reason: BiometryErrorType.none,
        code: BiometryErrorType.none,
        strongReason: undefined,
        strongCode: undefined,
      })
    );

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("handle-biometric-btn"));
    });

    await waitFor(() => {
      expect(checkBiometry).toBeCalled();
      expect(authenticate).not.toBeCalled();
      expect(getByText("Biometry not available")).toBeVisible();
    });
  });

  test("Biometry too weak", async () => {
    checkBiometry.mockImplementation(() =>
      Promise.resolve({
        isAvailable: true,
        strongBiometryIsAvailable: false,
        biometryType: BiometryType.faceId,
        biometryTypes: [],
        deviceIsSecure: true,
        reason: BiometryErrorType.none,
        code: BiometryErrorType.none,
        strongReason: undefined,
        strongCode: undefined,
      })
    );

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("handle-biometric-btn"));
    });

    await waitFor(() => {
      expect(checkBiometry).toBeCalled();
      expect(authenticate).not.toBeCalled();
      expect(getByText("Biometry too weak")).toBeVisible();
    });
  });

  test("throw error when authenticate", async () => {
    authenticate.mockImplementation(() => Promise.reject("Something wrong"));

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("handle-biometric-btn"));
    });

    await waitFor(() => {
      expect(checkBiometry).toBeCalled();
      expect(getByText("Something wrong")).toBeVisible();
    });
  });

  test("throw biometric error when authenticate", async () => {
    authenticate.mockImplementation(() =>
      Promise.reject(
        new BiometryError(
          "Something wrong",
          BiometryErrorType.authenticationFailed
        )
      )
    );

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("handle-biometric-btn"));
    });

    await waitFor(() => {
      expect(checkBiometry).toBeCalled();
      expect(getByText("Something wrong")).toBeVisible();
    });
  });

  test("throw error when add event", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    const storeMocked = {
      ...mockStore(store),
      dispatch: dispatchMock,
    };

    addResumeListener.mockImplementation(() =>
      Promise.reject(new Error("Something wrong"))
    );

    render(
      <Provider store={storeMocked}>
        <TestComponent />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalled();
    });
  });
});
