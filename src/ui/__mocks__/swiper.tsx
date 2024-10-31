jest.mock("swiper/react", () => ({
  Swiper:({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
  },
  SwiperSlide: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
  },
  SwiperClass: jest.fn()
}))

jest.mock("swiper/modules", () => ({
  Pagination: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
  }
}));