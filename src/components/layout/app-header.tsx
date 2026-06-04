import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AppHeaderSyncProps = {
  lastSyncAt?: string;
  buttonLabel?: string;
  disabled?: boolean;
};

type AppHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  sync?: AppHeaderSyncProps;
};

function formatSyncTimestamp(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AppHeader({
  title,
  description,
  actions,
  sync,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {sync ? (
          <>
            {sync.lastSyncAt ? (
              <p className="max-w-32 text-right text-[11px] leading-tight text-muted-foreground md:max-w-none md:text-xs">
                Last sync at {formatSyncTimestamp(sync.lastSyncAt)}
              </p>
            ) : null}
            <Button
              size="sm"
              className="cursor-pointer"
              disabled={sync.disabled ?? true}
            >
              {sync.buttonLabel ?? "Sync now"}
            </Button>
          </>
        ) : null}
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
