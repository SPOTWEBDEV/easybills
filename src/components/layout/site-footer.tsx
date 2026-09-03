import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Logo size="sm" />
        <p className="text-xs text-ink-faint">
          &copy; {new Date().getFullYear()} EasyBills. All rights reserved.
        </p>
        <div className="flex gap-5 text-xs text-ink-faint">
          <a href="#" className="hover:text-ink">
            Terms
          </a>
          <a href="#" className="hover:text-ink">
            Privacy
          </a>
          <Link href="/login" className="hover:text-ink">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
