import { render, waitFor } from "@testing-library/react";
import { SideSlider } from "./SideSlider";

describe("Side Slider", () => {
  test("Render as modal", async () => {
    const { getByText, getByTestId } = render(
      <SideSlider
        isOpen
        renderAsModal
      >
        <div>Content</div>
      </SideSlider>
    );

    await waitFor(() => {
      expect(getByText("Content")).toBeInTheDocument();

      expect(
        getByTestId("side-slider").classList.contains("side-slider-modal")
      ).toBe(true);
    });
  });

  test("Render as normal page", async () => {
    const { getByText, getByTestId } = render(
      <SideSlider isOpen>
        <div>Content</div>
      </SideSlider>
    );

    await waitFor(() => {
      expect(getByText("Content")).toBeInTheDocument();

      expect(
        getByTestId("side-slider").classList.contains("side-slider-container")
      ).toBe(true);
    });
  });
});
