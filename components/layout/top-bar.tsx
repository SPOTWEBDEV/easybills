import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { User } from "@/lib/types";

export function TopBar({ user, title }: { user?: User; title?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      {title ? (
        <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{user?.avatarInitials ?? "KT"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-ink-600 dark:text-paper-200/50">Welcome back,</p>
            <p className="text-sm font-semibold">{user?.fullName.split(" ")[0] ?? "Guest"}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 transition-colors hover:bg-ink-200 dark:hover:bg-ink-700"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-white dark:ring-ink-900" />
        </Link>
      </div>
    </div>
  );
}
