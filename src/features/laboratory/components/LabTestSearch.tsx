import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import { useLabTestSearch } from "../hooks/useLabTestSearch";
import type { LabTestMaster } from "../types/laboratory.types";

export interface LabTestSearchProps {
  value: LabTestMaster | string | null;
  onChange: (value: LabTestMaster | string | null) => void;
  onSelect?: (test: LabTestMaster) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const LabTestSearch = ({
  value,
  onChange,
  onSelect,
  label = "Lab Test",
  error,
  helperText,
  disabled,
}: LabTestSearchProps) => {
  const displayValue = typeof value === "string" ? value : (value?.testName ?? "");
  const [query, setQuery] = useState(displayValue);

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  const searchQuery = useLabTestSearch(query.trim().length > 0 ? query : "");
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
          setQuery(option.testName);
        } else {
          onChange(null);
          setQuery("");
        }
      }}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.testName)}
      isOptionEqualToValue={(option, selected) =>
        typeof option !== "string" && typeof selected !== "string" && option.id === selected.id
      }
      renderOption={(props, option) => (
        <li {...props} key={typeof option === "string" ? option : option.id}>
          {typeof option === "string" ? (
            option
          ) : (
            <>
              {option.testName}
              {option.testCode ? ` • ${option.testCode}` : ""}
              {option.department ? ` (${option.department})` : ""}
            </>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required
          error={error}
          helperText={helperText}
          placeholder="Search lab tests"
        />
      )}
    />
  );
};

export default LabTestSearch;
