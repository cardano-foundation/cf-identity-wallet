import { RoutePath } from "../../const/route";

const isRootPath = (path: string) => path === RoutePath.Connections;

const isActivePath = (path: string, location: string) => {
  return isRootPath(path)
    ? RoutePath.Connections === location || location.includes("connections")
    : location.startsWith(path);
};

export { isActivePath };
