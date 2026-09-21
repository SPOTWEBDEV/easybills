import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper-50 dark:bg-ink-950 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>

        <div className="mt-8 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-600 dark:text-paper-200/60">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
