enum SpinnerConverage {
  Screen = "screen",
  Container = "container",
}

interface SpinnerProps {
  show: boolean;
  coverage?: SpinnerConverage;
}

export type { SpinnerProps };
export { SpinnerConverage };
