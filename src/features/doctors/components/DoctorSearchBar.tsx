import { InputAdornment, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export interface DoctorSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const DoctorSearchBar = ({ value, onChange }: DoctorSearchBarProps) => (
  <TextField
    fullWidth
    size="small"
    placeholder="Search by doctor code, name, mobile, email, or registration number"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      },
    }}
  />
);

export default DoctorSearchBar;
