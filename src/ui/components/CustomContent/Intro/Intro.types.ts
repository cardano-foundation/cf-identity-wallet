import { IntroImg0Type } from "./Intro";

interface SlideItem {
  image: string;
  description?: string;
  title?: string;
  lottie?: IntroImg0Type;
}

interface IntroProps {
  items?: SlideItem[];
}

export type { SlideItem, IntroProps };
