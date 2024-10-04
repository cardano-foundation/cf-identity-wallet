import { render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useSwipeBack } from "./swipeBackHook";

const getPlatformsMock = jest.fn(() => ["ios", "mobile"]);
const enableFunc = jest.fn();
const destroyFnc = jest.fn();
const createGestureMock = jest.fn(() => ({
  enable: () => enableFunc(),
  destroy: () => destroyFnc(),
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  getPlatforms: () => getPlatformsMock(),
  createGesture: () => createGestureMock(),
}));

const endFunc = jest.fn();

const TestComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  useSwipeBack(
    () => ref.current,
    () => true,
    () => {
      endFunc();
    }
  );

  return <div ref={ref}>Element</div>;
};

describe("Swipe back hook", () => {
  test("run", async () => {
    const { unmount } = render(<TestComponent />);

    await waitFor(() => {
      expect(createGestureMock).toBeCalled();
      expect(enableFunc).toBeCalled();
    });

    unmount();

    await waitFor(() => {
      expect(destroyFnc).toBeCalled();
    });
  });
});
