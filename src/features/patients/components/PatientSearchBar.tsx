import { useEffect, useState } from "react";
import { InputAdornment, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export interface PatientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Debounces keystrokes before notifying the parent, so the search query
 * (and its network request, see `usePatientSearch`) doesn't fire on every
 * keystroke.
 */
const PatientSearchBar = ({
  value,
  onChange,
  placeholder = "Search by MRN, UHID, name, mobile, or email",
}: PatientSearchBarProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // Only re-run when the local draft changes; `value`/`onChange` are
    // read at fire time via the closure and intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <TextField
      fullWidth
      size="small"
      label="Search patients"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PatientSearchBar;
