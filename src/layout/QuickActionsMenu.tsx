import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LocalHotelRoundedIcon from "@mui/icons-material/LocalHotelRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import { useAuth } from "../features/auth";

const QuickActionsMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const can = (perm: string) => Boolean(user?.isSuperuser || user?.permissions.includes(perm));

  const actions = [
    { label: "New Patient", icon: <PeopleAltRoundedIcon fontSize="small" />, path: "/patients/new", perm: "patients:create" },
    { label: "New Appointment", icon: <EventAvailableRoundedIcon fontSize="small" />, path: "/appointments/new", perm: "appointments:create" },
    { label: "New Consultation", icon: <AddRoundedIcon fontSize="small" />, path: "/consultations/new", perm: "consultations:create" },
    { label: "New Admission", icon: <LocalHotelRoundedIcon fontSize="small" />, path: "/ipd/admissions/new", perm: "ipd:create" },
    { label: "New Invoice", icon: <ReceiptLongRoundedIcon fontSize="small" />, path: "/billing/invoices/new", perm: "billing:create" },
  ].filter((a) => can(a.perm));

  if (!actions.length) return null;

  return (
    <>
      <Tooltip title="Quick actions">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Quick actions"
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            width: 34,
            height: 34,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <BoltRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        {actions.map((action, index) => (
          <div key={action.path}>
            {index > 0 && index === actions.length - 1 ? <Divider sx={{ my: 0.5 }} /> : null}
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(action.path);
              }}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText primary={action.label} primaryTypographyProps={{ variant: "body2" }} />
            </MenuItem>
          </div>
        ))}
      </Menu>
    </>
  );
};

export default QuickActionsMenu;
