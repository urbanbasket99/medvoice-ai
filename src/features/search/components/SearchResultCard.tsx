import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { SEARCH_CATEGORY_LABELS, highlightMatch } from "../utils/searchUtils";
import type { SearchResult } from "../types/search.types";

export interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  selected?: boolean;
  onClick: () => void;
}

const SearchResultCard = ({ result, query, selected = false, onClick }: SearchResultCardProps) => {
  const primaryText = result.highlight ?? result.title;
  const highlightedTitle = highlightMatch(primaryText, query);

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 1.5,
        cursor: "pointer",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "action.selected" : "background.paper",
        "&:hover": { bgcolor: "action.hover" },
        "& mark": {
          bgcolor: "warning.light",
          color: "inherit",
          px: 0.25,
          borderRadius: 0.5,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
            <Chip size="small" label={SEARCH_CATEGORY_LABELS[result.category]} variant="outlined" />
            <Typography
              variant="subtitle2"
              fontWeight={600}
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {result.subtitle}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }} noWrap>
            {result.description}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SearchResultCard;
