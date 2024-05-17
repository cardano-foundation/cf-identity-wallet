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

  return {
    showConnections,
    setShowConnections,
  };
};

export { useToggleConnections };
