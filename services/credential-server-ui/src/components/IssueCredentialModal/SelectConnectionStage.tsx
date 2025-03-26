import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
} from "@mui/material";
import { SelectConnectionStageProps } from "./IssueCredentialModal.types";

const SelectConnectionStage = ({
  value,
  onChange,
  connections,
}: SelectConnectionStageProps) => {
  return (
    <List className="connection-list">
      {connections.map((connection, index) => {
        const labelId = `checkbox-list-label-${connection.id}`;

        return (
          <ListItem
            key={connection.id}
            disablePadding
            secondaryAction={`${connection.id.substring(0, 4)}...${connection.id.slice(-4)}`}
            divider={index !== connections.length - 1}
          >
            <ListItemButton
              role={undefined}
              onClick={() => onChange(connection.id)}
              dense
            >
              <ListItemIcon>
                <Radio
                  edge="start"
                  checked={value === connection.id}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={connection.alias}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export { SelectConnectionStage };
