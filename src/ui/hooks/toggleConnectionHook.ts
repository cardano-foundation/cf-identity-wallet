import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RoutePath } from "../../routes";

const useToggleConnections = (location: string) => {
  const history = useHistory();
  const [showConnections, setShowConnections] = useState(false);

  useEffect(() => {
    if (
      [RoutePath.CONNECTION_DETAILS, location].includes(
        history.location.pathname
      )
    )
      return;
    setShowConnections(false);
  }, [history.location.pathname]);

  useEffect(() => {
    const openConnections = (history.location.state as Record<string, unknown>)
      ?.openConnections;

    if (openConnections) {
      setShowConnections(true);
      history.replace(history.location.pathname, {});
    }
  }, [history, history.location.state, setShowConnections]);

  return {
    showConnections,
    setShowConnections,
  };
};

export { useToggleConnections };
