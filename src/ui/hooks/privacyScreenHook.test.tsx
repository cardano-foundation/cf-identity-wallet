import { render, waitFor } from "@testing-library/react";
import { usePrivacyScreen } from "./privacyScreenHook";

const isNativePlatform = jest.fn();

jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => isNativePlatform(),
    },
  };
});

const enable = jest.fn();
const disable = jest.fn();

jest.mock("@capacitor-community/privacy-screen", () => {
  return {
    ...jest.requireActual("@capacitor-community/privacy-screen"),
    PrivacyScreen: {
      enable: () => enable(),
      disable: () => disable(),
    },
  };
});

const TestComponent = () => {
  usePrivacyScreen();

  return <></>;
};

describe("Privacy screen hook", () => {
  test("run", async () => {
    isNativePlatform.mockImplementation(() => true);
    const { unmount } = render(<TestComponent />);

    await waitFor(() => {
      expect(enable).toBeCalled();
    });

    unmount();

    await waitFor(() => {
      expect(disable).toBeCalled();
    });
  });
});
