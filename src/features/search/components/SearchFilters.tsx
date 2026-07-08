import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { ALL_SEARCH_CATEGORIES } from "../api/searchQueries";
import { SEARCH_CATEGORY_LABELS } from "../utils/searchUtils";
import type { SearchCategory } from "../types/search.types";

export interface SearchFiltersProps {
  value: SearchCategory[];
  onChange: (categories: SearchCategory[]) => void;
}

const SearchFilters = ({ value, onChange }: SearchFiltersProps) => {
  const toggleCategory = (category: SearchCategory) => {
    if (value.includes(category)) {
      onChange(value.filter((entry) => entry !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
      {ALL_SEARCH_CATEGORIES.map((category) => (
        <Chip
          key={category}
          size="small"
          label={SEARCH_CATEGORY_LABELS[category]}
          clickable
          color={value.includes(category) ? "primary" : "default"}
          variant={value.includes(category) ? "filled" : "outlined"}
          onClick={() => toggleCategory(category)}
        />
      ))}
    </Stack>
  );
};

export default SearchFilters;
