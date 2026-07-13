import { useState } from "react";
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

const HOSPITALS = [
  { id: "main", name: "MedVoice General Hospital", location: "Main Campus" },
  { id: "north", name: "MedVoice North Wing", location: "Annex" },
] as const;

const HospitalSelector = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string>("main");
  const selected = HOSPITALS.find((h) => h.id === selectedId) ?? HOSPITALS[0];

  return (
    <>
      <Button
        size="small"
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<BusinessRoundedIcon fontSize="small" />}
        endIcon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
        aria-label="Select hospital"
        sx={{
          display: { xs: "none", md: "inline-flex" },
          textTransform: "none",
          color: "text.primary",
          borderRadius: 2,
          px: 1.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ textAlign: "left", lineHeight: 1.2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
            {selected.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {selected.location}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 260, mt: 0.5 } } }}
      >
        {HOSPITALS.map((hospital) => (
          <MenuItem
            key={hospital.id}
            selected={hospital.id === selectedId}
            onClick={() => {
              setSelectedId(hospital.id);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {hospital.id === selectedId ? <CheckRoundedIcon fontSize="small" color="primary" /> : null}
            </ListItemIcon>
            <ListItemText
              primary={hospital.name}
              secondary={hospital.location}
              primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default HospitalSelector;
