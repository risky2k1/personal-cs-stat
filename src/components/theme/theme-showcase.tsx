import { MarkerIcon } from "@/components/match/marker-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SWATCHES = [
  { name: "Background", className: "bg-background border" },
  { name: "Card", className: "bg-card border" },
  { name: "Primary", className: "bg-primary" },
  { name: "CT", className: "bg-ct" },
  { name: "T", className: "bg-t-side" },
  { name: "Success", className: "bg-success" },
  { name: "Destructive", className: "bg-destructive" },
  { name: "Highlight", className: "bg-highlight" },
] as const;

const MARKER_SAMPLES = [
  { icon: "crosshair" as const, label: "Kill" },
  { icon: "skull" as const, label: "Death" },
  { icon: "bomb" as const, label: "Plant" },
  { icon: "star" as const, label: "Clutch", severity: "highlight" as const },
  { icon: "fire" as const, label: "Multi-kill", severity: "highlight" as const },
];

export function ThemeShowcase() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Colors
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className={cnSwatch(s.className)} />
              <p className="text-xs text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Typography
        </h2>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <p className="text-2xl font-semibold">JetBrains Mono — Page title</p>
            <p className="text-base text-muted-foreground">
              Body copy for analysis and descriptions.
            </p>
            <p className="text-sm">ADR 86.4 · K/D 1.33 · 13:09</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Buttons & badges
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button className="cursor-pointer">Primary</Button>
          <Button variant="secondary" className="cursor-pointer">
            Secondary
          </Button>
          <Button variant="outline" className="cursor-pointer">
            Outline
          </Button>
          <Button variant="destructive" className="cursor-pointer">
            Destructive
          </Button>
          <Badge className="border-success/40 text-success">Parsed</Badge>
          <Badge className="border-ct/40 text-ct">CT 13</Badge>
          <Badge className="border-t-side/40 text-t-side">T 9</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Timeline markers (Lucide)
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event icons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            {MARKER_SAMPLES.map((m) => (
              <div
                key={m.label}
                className="flex cursor-default flex-col items-center gap-1"
              >
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
                  <MarkerIcon
                    icon={m.icon}
                    severity={m.severity ?? "normal"}
                    className="size-5"
                  />
                </div>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground">
        Source of truth:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          design-system/cs2-match-analyzer/MASTER.md
        </code>
      </p>
    </div>
  );
}

function cnSwatch(className: string) {
  return `h-14 w-full rounded-md ${className}`;
}
