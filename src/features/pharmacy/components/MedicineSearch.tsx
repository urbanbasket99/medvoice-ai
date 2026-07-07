import { Autocomplete, TextField } from "@mui/material";
import { useMemo, useState } from "react";

import { useMedicineSearch } from "../hooks/useMedicines";
import type { PharmacyMedicine } from "../types/pharmacy.types";

export interface MedicineSearchProps {
  value: PharmacyMedicine | string | null;
  onChange: (value: PharmacyMedicine | string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const MedicineSearch = ({
  value,
  onChange,
  label = "Search Medicine",
  disabled = false,
  error = false,
  helperText,
}: MedicineSearchProps) => {
  const [inputValue, setInputValue] = useState("");

  const searchQuery = useMedicineSearch(inputValue);
  const options = useMemo(() => searchQuery.data?.items ?? [], [searchQuery.data?.items]);

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={options}
      loading={searchQuery.isFetching}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : `${option.brandName} (${option.genericName})`
      }
      isOptionEqualToValue={(option, val) =>
        typeof option !== "string" && typeof val !== "string" && option.id === val.id
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default MedicineSearch;
