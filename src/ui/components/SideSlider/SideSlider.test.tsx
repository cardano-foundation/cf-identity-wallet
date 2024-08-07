import { fireEvent, render, waitFor } from "@testing-library/react";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { act } from "react-dom/test-utils";
import { SideSlider } from "./SideSlider";

describe("Side Slider", () => {
  test("Render as modal", async () => {
    const closeAnimation = jest.fn();
    const openAnimation = jest.fn();

    const { getByText, getByTestId, rerender } = render(
      <SideSlider
        isOpen
        renderAsModal
        onCloseAnimationEnd={closeAnimation}
        onOpenAnimationEnd={openAnimation}
      >
        <div>Content</div>
      </SideSlider>
    );

    await waitForIonicReact();
    await waitFor(() => {
      expect(getByText("Content")).toBeInTheDocument();

      expect(
        getByTestId("side-slider").classList.contains("side-slider-modal")
      ).toBe(true);
    });

    await waitFor(() => {
      expect(openAnimation).toBeCalled();
    });

    rerender(
      <SideSlider
        isOpen={false}
        renderAsModal
        onCloseAnimationEnd={closeAnimation}
        onOpenAnimationEnd={openAnimation}
      >
        <div>Content</div>
      </SideSlider>
    );

    await waitFor(() => {
      expect(closeAnimation).toBeCalled();
    });
  });

  test("Render as normal page", async () => {
    const endAnimation = jest.fn();
    const openAnimation = jest.fn();

    const { getByText, getByTestId, rerender } = render(
      <SideSlider
        isOpen
        onCloseAnimationEnd={endAnimation}
        onOpenAnimationEnd={openAnimation}
      >
        <div>Content</div>
      </SideSlider>
    );

    await waitFor(() => {
      expect(getByText("Content")).toBeInTheDocument();

      expect(
        getByTestId("side-slider").classList.contains("side-slider-container")
      ).toBe(true);
    });

    act(() => {
      fireEvent.transitionEnd(getByTestId("side-slider"));
    });

    await waitFor(() => {
      expect(openAnimation).toBeCalled();
    });

    rerender(
      <SideSlider
        isOpen={false}
        onCloseAnimationEnd={endAnimation}
        onOpenAnimationEnd={openAnimation}
      >
        <div>Content</div>
      </SideSlider>
    );

    act(() => {
      fireEvent.transitionEnd(getByTestId("side-slider"));
    });

    await waitFor(() => {
      expect(endAnimation).toBeCalled();
    });
  });
});
