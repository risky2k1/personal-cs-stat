"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SortableTableHead,
  type SortDirection,
} from "@/components/match/sortable-table-head";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_MATCHES, formatDuration, type MockMatch } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

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

export function MatchesTable() {
  const [sortKey, setSortKey] = useState<MatchSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

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

  const sorted = useMemo(
    () => sortMatches(MOCK_MATCHES, sortKey, sortDir),
    [sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <Card>
      <CardContent className="p-0">
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
            {pageRows.map((match) => (
              <TableRow key={match.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">
                  {match.map_name.replace("de_", "")}
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
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)} của {sorted.length}{" "}
            trận
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={safePage <= 1}
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
              disabled={safePage >= totalPages}
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
