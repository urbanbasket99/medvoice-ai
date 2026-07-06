import { useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import type { AuthUser } from "../types/auth.types";

export interface UserMenuProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

const getInitials = (fullName: string): string => {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest.length > 0 ? rest[rest.length - 1] : "";
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
};

/**
 * Header account menu: avatar trigger + dropdown with user identity and a
 * logout action. Consumes `useAuth()` output via props so it stays
 * decoupled from where it is rendered (currently `App.tsx`'s app shell).
 */
const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        aria-label="Account menu"
        aria-controls={isOpen ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : undefined}
      >
        <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>{getInitials(user.fullName)}</Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => void handleLogout()}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
