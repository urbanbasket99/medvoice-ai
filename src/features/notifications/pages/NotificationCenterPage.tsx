import { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";

import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import NotificationCard from "../components/NotificationCard";
import { useNotifications } from "../hooks/useNotifications";
import { useMarkAllNotificationsRead } from "../hooks/useNotificationMutations";
import { NOTIFICATION_TYPE_LABELS } from "../utils/notificationUtils";
import type { NotificationType } from "../types/notification.types";

type ReadFilter = "all" | "unread" | "read";

const READ_TABS: { value: ReadFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const TYPE_OPTIONS: Array<{ value: NotificationType | ""; label: string }> = [
  { value: "", label: "All Types" },
  ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({
    value: value as NotificationType,
    label,
  })),
];

const NotificationCenterPage = () => {
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markAllRead = useMarkAllNotificationsRead();

  const isReadParam =
    readFilter === "all" ? undefined : readFilter === "unread" ? false : true;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotifications({
    pageSize: 20,
    notificationType: typeFilter || undefined,
    isRead: isReadParam,
    search: search || undefined,
  });

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasFilters = Boolean(typeFilter || readFilter !== "all" || search);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 400);
  }, []);

  const clearFilters = useCallback(() => {
    setReadFilter("all");
    setTypeFilter("");
    setSearch("");
    setSearchInput("");
  }, []);

  // Intersection Observer sentinel for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Notification Center"
        subtitle="Review alerts, reminders, and system messages."
        actions={
          <Button
            variant="outlined"
            startIcon={<DoneAllRoundedIcon />}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || unreadCount === 0}
          >
            Mark All Read
          </Button>
        }
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        sx={{ mb: 0 }}
      >
        <TextField
          size="small"
          placeholder="Search notifications…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240, flexGrow: { xs: 1, sm: 0 } }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | "")}
          >
            {TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Button
            size="small"
            variant="text"
            startIcon={<FilterListOffRoundedIcon fontSize="small" />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </Stack>

      {/* Read / Unread tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={readFilter} onChange={(_, v: ReadFilter) => setReadFilter(v)}>
          {READ_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <Divider />

      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={88} />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={NotificationsNoneRoundedIcon}
          title="No notifications found"
          action={
            hasFilters ? (
              <Button size="small" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Box>
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}

          {/* Infinite scroll sentinel */}
          <Box
            ref={sentinelRef}
            sx={{ py: 2, display: "flex", justifyContent: "center" }}
          >
            {isFetchingNextPage && <CircularProgress size={24} />}
            {!hasNextPage && notifications.length > 0 && (
              <Typography variant="caption" color="text.disabled">
                All notifications loaded
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default NotificationCenterPage;
