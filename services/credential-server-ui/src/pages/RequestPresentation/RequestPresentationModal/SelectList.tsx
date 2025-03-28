import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
} from "@mui/material";
import { SelectListProps } from "./RequestPresentationModal.types";

const SelectList = ({ value, onChange, data }: SelectListProps) => {
  return (
    <List className="connection-list">
      {data.map((item, index) => {
        const labelId = `checkbox-list-label-${item.id}`;

        return (
          <ListItem
            key={item.id}
            disablePadding
            secondaryAction={item.subText}
            divider={index !== data.length - 1}
            className={value === item.id ? "active" : undefined}
          >
            <ListItemButton
              role={undefined}
              onClick={() => onChange(item.id)}
              dense
            >
              <ListItemIcon>
                <Radio
                  edge="start"
                  checked={value === item.id}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={item.text}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export { SelectList };
