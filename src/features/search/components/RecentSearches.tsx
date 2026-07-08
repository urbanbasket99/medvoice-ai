import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

export interface RecentSearchesProps {
  items: string[];
  onSelect: (query: string) => void;
}

const RecentSearches = ({ items, onSelect }: RecentSearchesProps) => {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent searches yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <HistoryRoundedIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={600}>
          Recent Searches
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {items.map((item) => (
          <Button key={item} size="small" variant="outlined" onClick={() => onSelect(item)}>
            {item}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

export default RecentSearches;
