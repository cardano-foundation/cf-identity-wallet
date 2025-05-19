import { ReactNode } from "react";

interface ComponentProps {
  children: ReactNode;
  ["data-testid"]: string;
  [key: string]: unknown;
}

jest.mock("swiper/react", () => ({
  Swiper: ({ children, ...props }: ComponentProps) => {
    const testId = props["data-testid"];
    return <div data-testid={testId}>{children}</div>;
  },
  SwiperSlide: ({ children, ...props }: ComponentProps) => {
    const testId = props["data-testid"];
    return <div data-testid={testId}>{children}</div>;
  },
  SwiperClass: jest.fn(),
}));

jest.mock("swiper/modules", () => ({
  Pagination: ({ children, ...props }: ComponentProps) => {
    const testId = props["data-testid"];
    return <div data-testid={testId}>{children}</div>;
  },
}));

jest.mock("swiper/css", () => ({}));
jest.mock("swiper/css/autoplay", () => ({}));
jest.mock("@ionic/react/css/ionic-swiper.css", () => ({}));
