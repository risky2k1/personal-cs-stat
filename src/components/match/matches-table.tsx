"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import {
  SortableTableHead,
  type SortDirection,
} from "@/components/match/sortable-table-head";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDuration, type MockMatch } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;
const DATE_FILTERS = [
  { id: "7d", label: "1 tuần", days: 7 },
  { id: "30d", label: "1 tháng", days: 30 },
  { id: "180d", label: "6 tháng", days: 180 },
  { id: "365d", label: "12 tháng", days: 365 },
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  fetching_demo: "Fetching",
  demo_downloaded: "Downloaded",
  parsing: "Parsing",
  parsed: "Parsed",
  failed: "Failed",
};

export type MatchSortKey =
  | "map"
  | "date"
  | "score"
  | "kills"
  | "deaths"
  | "assists"
  | "adr"
  | "duration"
  | "status";

type DateFilterId = (typeof DATE_FILTERS)[number]["id"] | "all";

function statusClass(status: string) {
  if (status === "parsed") return "border-success/40 text-success";
  if (status === "failed") return "border-destructive/40 text-destructive";
  if (status === "parsing" || status === "fetching_demo")
    return "border-ct/40 text-ct";
  return "";
}

function compareNullableNum(
  a: number | null,
  b: number | null,
  dir: SortDirection,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir === "asc" ? a - b : b - a;
}

function sortMatches(
  rows: MockMatch[],
  key: MatchSortKey,
  direction: SortDirection,
): MockMatch[] {
  const sorted = [...rows];
  const dir = direction;

  sorted.sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "map":
        cmp = a.map_name.localeCompare(b.map_name);
        break;
      case "date":
        cmp =
          new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        break;
      case "score":
        cmp =
          a.team_a_score - a.team_b_score - (b.team_a_score - b.team_b_score);
        break;
      case "kills":
        return compareNullableNum(a.kills, b.kills, dir);
      case "deaths":
        return compareNullableNum(a.deaths, b.deaths, dir);
      case "assists":
        return compareNullableNum(a.assists, b.assists, dir);
      case "adr":
        return compareNullableNum(a.adr, b.adr, dir);
      case "duration":
        cmp = a.duration_seconds - b.duration_seconds;
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      default:
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });

  return sorted;
}

function formatMatchDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statCell(value: number | null) {
  if (value === null) return "—";
  return value;
}

function normalizeMapName(mapName: string) {
  return mapName.replace("de_", "");
}

function getDateFilterLabel(dateFilter: DateFilterId) {
  if (dateFilter === "all") return "Tất cả date";
  return DATE_FILTERS.find((filter) => filter.id === dateFilter)?.label ?? "Date";
}

function matchesDateFilter(
  startedAt: string,
  dateFilter: DateFilterId,
  newestTimestamp: number,
) {
  if (dateFilter === "all") return true;

  const selectedRange = DATE_FILTERS.find((filter) => filter.id === dateFilter);
  if (!selectedRange) return true;

  const matchTimestamp = new Date(startedAt).getTime();
  const diffMs = newestTimestamp - matchTimestamp;
  return diffMs <= selectedRange.days * 24 * 60 * 60 * 1000;
}

export function MatchesTable({ matches }: { matches: MockMatch[] }) {
  const [sortKey, setSortKey] = useState<MatchSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedMap, setSelectedMap] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterId>("all");

  const mapOptions = useMemo(
    () =>
      Array.from(new Set(matches.map((match) => match.map_name))).sort((a, b) =>
        normalizeMapName(a).localeCompare(normalizeMapName(b)),
      ),
    [matches],
  );
  const modeOptions = useMemo(
    () => Array.from(new Set(matches.map((match) => match.game_mode))).sort(),
    [matches],
  );
  const newestTimestamp = useMemo(
    () =>
      Math.max(
        ...matches.map((match) => new Date(match.started_at).getTime()),
      ),
    [matches],
  );

  const handleSort = (key: string) => {
    const k = key as MatchSortKey;
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(
        k === "date" || k === "kills" || k === "adr" ? "desc" : "asc",
      );
    }
    setPage(1);
  };

  const filtered = useMemo(
    () =>
      matches.filter((match) => {
        const mapOk = selectedMap === "all" || match.map_name === selectedMap;
        const modeOk =
          selectedMode === "all" || match.game_mode === selectedMode;
        const dateOk = matchesDateFilter(
          match.started_at,
          selectedDateFilter,
          newestTimestamp,
        );
        return mapOk && modeOk && dateOk;
      }),
    [matches, newestTimestamp, selectedDateFilter, selectedMap, selectedMode],
  );

  const sorted = useMemo(
    () => sortMatches(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const hasActiveFilters =
    selectedMap !== "all" ||
    selectedMode !== "all" ||
    selectedDateFilter !== "all";
  const activeFilters = [
    selectedMap !== "all"
      ? {
          id: "map",
          label: `Map: ${normalizeMapName(selectedMap)}`,
          clear: () => {
            setSelectedMap("all");
            setPage(1);
          },
        }
      : null,
    selectedMode !== "all"
      ? {
          id: "mode",
          label: `Mode: ${selectedMode}`,
          clear: () => {
            setSelectedMode("all");
            setPage(1);
          },
        }
      : null,
    selectedDateFilter !== "all"
      ? {
          id: "date",
          label: `Date: ${getDateFilterLabel(selectedDateFilter)}`,
          clear: () => {
            setSelectedDateFilter("all");
            setPage(1);
          },
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    clear: () => void;
  }[];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-3 border-b border-border px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-sm font-medium">Filters</p>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Map
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Chọn map</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedMap}
                    onValueChange={(value) => {
                      setSelectedMap(value);
                      setPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả map
                    </DropdownMenuRadioItem>
                    {mapOptions.map((mapName) => (
                      <DropdownMenuRadioItem key={mapName} value={mapName}>
                        {normalizeMapName(mapName)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Mode
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Chọn mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedMode}
                    onValueChange={(value) => {
                      setSelectedMode(value);
                      setPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả mode
                    </DropdownMenuRadioItem>
                    {modeOptions.map((mode) => (
                      <DropdownMenuRadioItem key={mode} value={mode}>
                        {mode}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Date
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Chọn mốc thời gian</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedDateFilter}
                    onValueChange={(value) => {
                      setSelectedDateFilter(value as DateFilterId);
                      setPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả date
                    </DropdownMenuRadioItem>
                    {DATE_FILTERS.map((filter) => (
                      <DropdownMenuRadioItem key={filter.id} value={filter.id}>
                        {filter.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  setSelectedMap("all");
                  setSelectedMode("all");
                  setSelectedDateFilter("all");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            ) : null}
          </div>

          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className="cursor-pointer"
                  onClick={filter.clear}
                >
                  <Badge
                    variant="outline"
                    className="gap-1 rounded-full px-2.5 py-1 text-xs"
                  >
                    {filter.label}
                    <X className="size-3" />
                  </Badge>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Map"
                sortKey="map"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Date"
                sortKey="date"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableTableHead
                label="Score"
                sortKey="score"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableTableHead
                label="K"
                sortKey="kills"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableTableHead
                label="D"
                sortKey="deaths"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableTableHead
                label="A"
                sortKey="assists"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableTableHead
                label="ADR"
                sortKey="adr"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableTableHead
                label="Duration"
                sortKey="duration"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableTableHead
                label="Status"
                sortKey="status"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((match) => (
                <TableRow key={match.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    {normalizeMapName(match.map_name)}
                    <p className="text-xs text-muted-foreground md:hidden">
                      {formatMatchDate(match.started_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.game_mode}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {formatMatchDate(match.started_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-ct">{match.team_a_score}</span>
                    <span className="text-muted-foreground"> — </span>
                    <span className="text-t-side">{match.team_b_score}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {statCell(match.kills)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {statCell(match.deaths)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {statCell(match.assists)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {match.adr ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDuration(match.duration_seconds)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(statusClass(match.status))}
                    >
                      {STATUS_LABEL[match.status] ?? match.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/matches/${match.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Không có trận nào khớp bộ lọc hiện tại.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length
              ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safePage * PAGE_SIZE,
                  sorted.length,
                )} của ${sorted.length} trận`
              : "0 trận"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={safePage <= 1 || sorted.length === 0}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span className="min-w-[4rem] text-center text-xs text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={safePage >= totalPages || sorted.length === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
