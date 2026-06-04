"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Menu, Settings, Swords, UserRound } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 md:hidden">
      <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Crosshair className="size-4" />
      </div>
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar />
        </SheetContent>
      </Sheet>
      <span className="text-sm font-medium">
        {pathname.startsWith("/matches/") ? "Match" : "CS2 Analyzer"}
      </span>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/overview", icon: UserRound, label: "Overview" },
    { href: "/matches", icon: Swords, label: "Matches" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2 text-xs transition-colors duration-200"
          >
            <Icon
              className={
                active ? "size-5 text-primary" : "size-5 text-muted-foreground"
              }
            />
            <span className={active ? "text-primary" : "text-muted-foreground"}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
