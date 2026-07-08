import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import RecentSearches from "./RecentSearches";
import SearchFilters from "./SearchFilters";
import SearchResults from "./SearchResults";
import { searchQueryKeys } from "../api/searchQueries";
import { useGlobalSearch, useRecentSearches } from "../hooks/useGlobalSearch";
import type { SearchCategory, SearchResult } from "../types/search.types";

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const searchParams = useMemo(
    () => ({
      query: debouncedQuery,
      categories: categories.length > 0 ? categories : undefined,
      limitPerCategory: 5,
    }),
    [debouncedQuery, categories],
  );

  const searchQuery = useGlobalSearch(searchParams);
  const recentQuery = useRecentSearches();

  const flatResults = useMemo(
    () => searchQuery.data?.groups.flatMap((group) => group.items) ?? [],
    [searchQuery.data],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, categories, flatResults.length]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose();
      setQuery("");
      void queryClient.invalidateQueries({ queryKey: searchQueryKeys.recent() });
      navigate(result.route);
    },
    [navigate, onClose, queryClient],
  );

  const handleClose = () => {
    onClose();
    setQuery("");
    setDebouncedQuery("");
    setSelectedIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(flatResults.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter" && flatResults[selectedIndex]) {
      event.preventDefault();
      handleSelect(flatResults[selectedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Global Search
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Search patients, doctors, appointments, billing, and more
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          placeholder="Search the hospital system…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <SearchFilters value={categories} onChange={setCategories} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {!debouncedQuery && (
          <Box sx={{ mb: 3 }}>
            <RecentSearches
              items={recentQuery.data?.items ?? []}
              onSelect={(value) => setQuery(value)}
            />
          </Box>
        )}

        <SearchResults
          data={searchQuery.data}
          query={debouncedQuery}
          loading={searchQuery.isFetching}
          selectedIndex={selectedIndex}
          flatResults={flatResults}
          onSelect={handleSelect}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          Use ↑ ↓ to navigate, Enter to open, Esc to close
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
