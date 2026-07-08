import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

import EmptyState from "../../../components/ui/EmptyState";
import SearchResultCard from "./SearchResultCard";
import type { GlobalSearchResult, SearchResult } from "../types/search.types";

export interface SearchResultsProps {
  data: GlobalSearchResult | undefined;
  query: string;
  loading: boolean;
  selectedIndex: number;
  flatResults: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

const SearchResults = ({
  data,
  query,
  loading,
  selectedIndex,
  flatResults,
  onSelect,
}: SearchResultsProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!query.trim()) {
    return (
      <Typography variant="body2" color="text.secondary">
        Start typing to search across patients, doctors, appointments, and more.
      </Typography>
    );
  }

  if (query.trim().length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Enter at least 2 characters to search.
      </Typography>
    );
  }

  if (!data || data.total === 0) {
    return (
      <EmptyState icon={SearchOffRoundedIcon} title={`No results found for “${query}”`} />
    );
  }

  return (
    <Stack spacing={3}>
      {data.groups.map((group) => (
        <Box key={group.category}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            {group.label}
          </Typography>
          <Stack spacing={1}>
            {group.items.map((result) => {
              const flatIndex = flatResults.findIndex(
                (entry) => entry.id === result.id && entry.category === result.category,
              );
              return (
                <SearchResultCard
                  key={`${result.category}-${result.id}`}
                  result={result}
                  query={query}
                  selected={flatIndex === selectedIndex}
                  onClick={() => onSelect(result)}
                />
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default SearchResults;
