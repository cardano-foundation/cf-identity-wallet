import { ChevronLeftOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { PageHeaderProps } from "./PageHeader.types";

export const PageHeader = ({ title, onBack, action, sx }: PageHeaderProps) => {
  return (
    <Box
      className="page-header"
      sx={{
        "&": (theme) => ({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "start",
          },
        }),
        ...sx,
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          [theme.breakpoints.down("sm")]: {
            marginBottom: "1rem",
          },
        })}
      >
        {onBack && (
          <ChevronLeftOutlined
            sx={{ cursor: "pointer" }}
            onClick={onBack}
          />
        )}
        <Typography
          variant="h1"
          component="h1"
        >
          {title}
        </Typography>
      </Box>
      <Box>{action}</Box>
    </Box>
  );
};
