"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import {
  MOCK_ACCOUNT_STATS,
  MOCK_ANOMALIES,
  MOCK_PERFORMANCE_LEFT,
  MOCK_PERFORMANCE_RIGHT,
  MOCK_PROFILE,
} from "@/lib/mock-profile";
import { StatMetricBar } from "@/components/overview/stat-metric-bar";
import { TrustGauge } from "@/components/overview/trust-gauge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OverviewContent() {
  const p = MOCK_PROFILE;
  const sampleWarning = p.matchesAnalyzed < p.matchesRequired;

  return (
    <div className="min-w-0 flex-1 space-y-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-2">
          <div>
            <CardTitle>Player reputation</CardTitle>
            <CardDescription>
              Data-driven analysis of gameplay patterns and performance trends.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              disabled
            >
              <Calendar className="size-3.5" />
              Last 30 days
            </Button>
            <Button variant="ghost" size="icon-sm" className="cursor-pointer" disabled>
              <TrendingUp className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleWarning ? (
            <div className="flex gap-3 rounded-lg border border-ct/30 bg-ct/5 px-4 py-3">
              <AlertTriangle className="size-5 shrink-0 text-ct" aria-hidden />
              <div className="text-sm">
                <p className="font-medium text-ct">Limited sample size</p>
                <p className="text-muted-foreground">
                  Analysis based on {p.matchesAnalyzed} parsed matches. Connect
                  more matches (need {p.matchesRequired}+) for higher confidence.
                </p>
              </div>
            </div>
          ) : null}

          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stats-based analysis
          </p>

          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            <TrustGauge percent={p.trustPercent} label={p.trustLabel} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                {MOCK_PERFORMANCE_LEFT.map((m) => (
                  <StatMetricBar
                    key={m.id}
                    label={m.label}
                    value={m.value}
                    percentile={m.percentile}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {MOCK_PERFORMANCE_RIGHT.map((m) => (
                  <StatMetricBar
                    key={m.id}
                    label={m.label}
                    value={m.value}
                    percentile={m.percentile}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Anomalies detected
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {MOCK_ANOMALIES.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.label}</span>
                    <Badge
                      variant="outline"
                      className={
                        a.severity === "high"
                          ? "border-destructive/40 text-destructive"
                          : a.severity === "medium"
                            ? "border-ct/40 text-ct"
                            : ""
                      }
                    >
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Account reputation</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MOCK_ACCOUNT_STATS.map((stat) => (
            <Card key={stat.id} size="sm">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {stat.value}
                </p>
                {stat.change ? (
                  <p
                    className={cn(
                      "mt-1 text-xs tabular-nums",
                      stat.change.startsWith("+")
                        ? "text-success"
                        : stat.change.startsWith("-")
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {stat.change}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Highlights, encounters & inventory — phase sau.
          </p>
          <Link
            href="/matches"
            className={buttonVariants({ size: "sm" })}
          >
            Xem match history
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
