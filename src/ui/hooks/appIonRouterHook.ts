import {
  AnimationBuilder,
  RouteAction,
  RouterDirection,
  RouterOptions,
  useIonRouter,
} from "@ionic/react";
import { useCallback, useMemo } from "react";

export const useAppIonRouter = () => {
  const ionRouter = useIonRouter();

  const push = useCallback(
    (
      pathname: string,
      routerDirection?: RouterDirection,
      routeAction?: RouteAction,
      routerOptions?: RouterOptions,
      animationBuilder?: AnimationBuilder
    ) => {
      ionRouter.push(
        pathname,
        routerDirection,
        routeAction,
        {
          unmount: true,
          ...routerOptions,
        },
        animationBuilder
      );
    },
    [ionRouter]
  );

  return useMemo(
    () => ({
      ...ionRouter,
      push,
    }),
    [push, ionRouter]
  );
};
