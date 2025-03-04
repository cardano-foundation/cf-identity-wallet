import { fireEvent, render, waitFor } from "@testing-library/react";
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
  const { enablePrivacy, disablePrivacy } = usePrivacyScreen();

  return (
    <>
      <button onClick={enablePrivacy}>Enable</button>
      <button onClick={disablePrivacy}>Disable</button>
    </>
  );
};

describe("Privacy screen hook", () => {
  test("run", async () => {
    isNativePlatform.mockImplementation(() => true);
    const { getByText } = render(<TestComponent />);

    fireEvent.click(getByText("Enable"));

    await waitFor(() => {
      expect(enable).toBeCalled();
    });

    fireEvent.click(getByText("Disable"));

    await waitFor(() => {
      expect(disable).toBeCalled();
    });
  });
});
