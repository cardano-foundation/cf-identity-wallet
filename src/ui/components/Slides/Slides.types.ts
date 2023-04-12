interface SlideItem {
  image: string;
  description: string;
  title: string;
}

interface SlideProps {
  items: SlideItem[];
}

export type { SlideItem, SlideProps };
