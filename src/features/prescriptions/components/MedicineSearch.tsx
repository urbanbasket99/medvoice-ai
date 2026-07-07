import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import { useMedicineSearch } from "../hooks/useMedicineSearch";
import type { MedicineMaster } from "../types/prescription.types";

export interface MedicineSearchProps {
  value: MedicineMaster | string | null;
  onChange: (value: MedicineMaster | string | null) => void;
  onSelect?: (medicine: MedicineMaster) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const MedicineSearch = ({
  value,
  onChange,
  onSelect,
  label = "Medicine",
  error,
  helperText,
  disabled,
}: MedicineSearchProps) => {
  const displayValue = typeof value === "string" ? value : (value?.name ?? "");
  const [query, setQuery] = useState(displayValue);

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  const searchQuery = useMedicineSearch(query.trim().length > 0 ? query : "");
  const options = searchQuery.data?.items ?? [];

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={options}
      loading={searchQuery.isFetching}
      inputValue={query}
      onInputChange={(_, newInput, reason) => {
        setQuery(newInput);
        if (reason === "input") {
          onChange(newInput);
        }
      }}
      value={typeof value === "string" ? null : value}
      onChange={(_, option) => {
        if (typeof option === "string") {
          onChange(option);
          setQuery(option);
          return;
        }
        if (option) {
          onChange(option);
          onSelect?.(option);
          setQuery(option.name);
        } else {
          onChange(null);
          setQuery("");
        }
      }}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
      isOptionEqualToValue={(option, selected) =>
        typeof option !== "string" && typeof selected !== "string" && option.id === selected.id
      }
      renderOption={(props, option) => (
        <li {...props} key={typeof option === "string" ? option : option.id}>
          {typeof option === "string" ? (
            option
          ) : (
            <>
              {option.name}
              {option.strength ? ` • ${option.strength}` : ""}
              {option.form ? ` (${option.form})` : ""}
            </>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} required error={error} helperText={helperText} placeholder="Search medicines" />
      )}
    />
  );
};

export default MedicineSearch;
