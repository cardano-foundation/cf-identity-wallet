enum LoadingType {
  Spin,
  Splash,
}

interface LoadingPageProps {
  type?: LoadingType;
  fullPage?: boolean;
}

export { LoadingType };
export type { LoadingPageProps };
