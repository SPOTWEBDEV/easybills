import Image from "next/image";
import { cx } from "@/lib/utils";

const TEXT_SIZE: Record<string, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

const ICON_SIZE: Record<string, number> = {
  sm: 72,
  md: 72,
  lg: 92,
};

/**
 * Compact icon + live-styled wordmark, for navbars/sidebars/footers.
 * Uses the real brand mark (extracted from the supplied logo files) so it
 * stays crisp and theme-correct at any size, rather than baking colored text
 * into a raster image.
 */
export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const px = ICON_SIZE[size];
  return (
    <span className={cx("flex items-center gap-2", className)}>
      <Image
        src="/logo-dark-full.png"
        alt="EasyBills"
        width={px}
        height={px}
        className="shrink-0"
        priority
      />
    </span>
  );
}

/**
 * Full lockup (icon + wordmark + tagline) as originally designed, swapped
 * between the light-background and dark-background variants. Best used
 * somewhere with room to breathe — the login screen, a splash state, etc.
 */
export function LogoFull({
  theme,
  width = 220,
  className,
}: {
  theme: "light" | "dark";
  width?: number;
  className?: string;
}) {
  const src = theme === "dark" ? "/logo-dark-full.png" : "/logo-light-full.png";
  const height = Math.round(width * (237 / 287));
  return (
    <Image
      src={src}
      alt="EasyBills — Pay, Buy, Recharge"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
