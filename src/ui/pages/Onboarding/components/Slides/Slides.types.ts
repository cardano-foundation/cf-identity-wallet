import { IntroImg0Type } from "../../Onboarding";

interface SlideItem {
  image: string;
  description?: string;
  title?: string;
  lottie?: IntroImg0Type;
}

interface SlideProps {
  items: SlideItem[];
}

export type { SlideItem, SlideProps };
