import { InputAdornment, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const ConsultationSearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <TextField
    fullWidth
    size="small"
    placeholder="Search by visit number, patient, doctor, diagnosis, or appointment"
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

export default ConsultationSearchBar;
