import { useState, MouseEvent } from "react";
import { Menu, MenuItem, Divider, Typography } from "@mui/material";
import "./DropDownMenu.scss";
import { DropdownMenuProps } from "./DropDownMenu.types";

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  button,
  menuItems,
  menuTitle,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        id="dropdown-menu-button"
        className={open ? "open" : "closed"}
      >
        {button}
      </div>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        className="dropdown-menu"
      >
        {menuTitle && <Typography>{menuTitle}</Typography>}
        {menuItems.map((item, index) =>
          "label" in item ? (
            <MenuItem
              key={index}
              onClick={(event) => {
                item.action();
                handleClose(event);
              }}
              disableRipple
              className={item.className}
              disabled={item.disabled}
            >
              {item.icon}
              <span>{item.label}</span>
            </MenuItem>
          ) : (
            <Divider
              key={index}
              className={item.className}
              sx={{ my: 0.5 }}
            />
          )
        )}
      </Menu>
    </div>
  );
};

export { DropdownMenu };
