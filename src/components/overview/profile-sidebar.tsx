import { MOCK_PROFILE } from "@/lib/mock-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function formatMemberSince(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function ProfileSidebar() {
  const p = MOCK_PROFILE;
  const initials = p.username.slice(0, 2).toUpperCase();

  return (
    <Card className="h-fit shrink-0 lg:w-72">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="size-20">
              {p.avatarUrl ? (
                <AvatarImage src={p.avatarUrl} alt={p.username} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-lg text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] font-bold text-primary-foreground">
              {p.steamLevel}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold">{p.username}</h2>
          <p className="text-xs text-muted-foreground">
            Member since {formatMemberSince(p.memberSince)}
          </p>
          <Badge variant="outline" className="mt-2 capitalize">
            {p.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Playtime
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {p.playtimeHours.toLocaleString()}h
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Inventory
            </p>
            <p className="text-sm font-semibold tabular-nums">
              ${p.inventoryValueUsd}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Premier</p>
            <p className="text-sm font-semibold text-primary tabular-nums">
              {p.premierRating.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-ct/30 bg-ct/10 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">FACEIT</p>
            <p className="text-sm font-semibold text-ct tabular-nums">
              {p.faceitLevel.toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Medals & pins
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {p.medals.map((medal) => (
              <div
                key={medal.id}
                className={cn(
                  "flex aspect-square cursor-default items-center justify-center rounded-md text-[9px] font-bold text-white",
                  medal.color,
                )}
                title={medal.label}
              >
                {medal.label}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <p className="text-center text-[10px] text-muted-foreground">
          Steam ID · {p.steamId.slice(-8)}
        </p>
      </CardContent>
    </Card>
  );
}
