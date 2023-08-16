import { RouteProps } from "react-router-dom";

interface AuthenticatedRouteProps extends RouteProps {
  nextPathname: string;
}

export type { AuthenticatedRouteProps };
