"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  LayoutDashboard,
  Palette,
  Settings,
  Swords,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/overview", label: "Overview", icon: UserRound, exact: true },
  { href: "/matches", label: "Matches", icon: Swords, matchPrefix: "/matches" },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Crosshair className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">CS2 Analyzer</p>
          <p className="truncate text-xs text-muted-foreground">Personal stats</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon, ...rest }) => {
          const active =
            "matchPrefix" in rest && rest.matchPrefix
              ? pathname === rest.matchPrefix ||
                pathname.startsWith(`${rest.matchPrefix}/`)
              : "exact" in rest && rest.exact
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <LayoutDashboard className="size-3.5 shrink-0" />
          <span>Prototype · mock data</span>
        </div>
      </div>
    </aside>
  );
}
