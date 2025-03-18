enum LoadingType {
  Spin,
  Splash,
}

interface LoadingPageProps {
  type?: LoadingType;
}

export { LoadingType };
export type { LoadingPageProps };
