import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { playCircleOutline, pauseCircleOutline } from "ionicons/icons";
import { Slides } from "./index";
import { ISlide } from "./Slides.types";

const slides: ISlide[] = [
  {
    image: "https://placehold.co/290x290",
    title: "Slide 1",
    description: "Description 1",
  },
  {
    image: "https://placehold.co/290x290",
    title: "Slide 2",
    description: "Description 2",
  },
  {
    image: "https://placehold.co/290x290",
    title: "Slide 3",
    description: "Description 3",
  },
];

test("renders Onboarding page", () => {
  render(<Slides slides={slides} />);
  const linkElement = screen.getByText(/Slide 1/i);
  expect(linkElement).toBeInTheDocument();
});

describe("handleAutoplay function", () => {
  test("handleAutoplay() should stop autoplay when pause icon is clicked", () => {
    const { getByTestId } = render(<Slides slides={slides} />);
    const playIcon = getByTestId("play-indicator");

    // Pause
    fireEvent.click(playIcon);

    expect(playIcon).toHaveAttribute("icon", playCircleOutline);
  });

  test("handleAutoplay() should start autoplay when play icon is clicked", () => {
    const { getByTestId } = render(<Slides slides={slides} />);
    const playIcon = getByTestId("play-indicator");

    // Pause
    fireEvent.click(playIcon);
    // Start
    fireEvent.click(playIcon);

    expect(playIcon).toHaveAttribute("icon", pauseCircleOutline);
  });
});
