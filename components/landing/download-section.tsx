"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotchCard } from "@/components/shared/notch-card";
import { Section } from "@/components/shared/section";
import { formatNaira } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Update these when your links are ready                              */
/* ------------------------------------------------------------------ */
const APK_URL = "/downloads/easybills.apk"; // put the file in /public/downloads/
const APK_VERSION = "v1.0.0";
const APK_SIZE = "42 MB";

const PLAY_STORE_URL: string | null = null; // e.g. "https://play.google.com/store/apps/details?id=com.easybills"
const APP_STORE_URL: string | null = null; // e.g. "https://apps.apple.com/app/id0000000000"

const installSteps = [
  {
    title: "Download the APK",
    body: "Tap the download button above. If your browser warns you, choose Keep.",
  },
  {
    title: "Allow the install",
    body: "Open the file. When asked, allow your browser to install apps from this source.",
  },
  {
    title: "Open EasyBills",
    body: "Tap Install, then Open, and create your free account.",
  },
];

type StoreBadgeProps = {
  href: string | null;
  src: string;
  alt: string;
  width: number;
  height: number;
  store: string;
};

function StoreBadge({ href, src, alt, width, height, store }: StoreBadgeProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="h-12 w-auto rounded-lg"
    />
  );

  // Link is live
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get EasyBills on ${store}`}
        className="rounded-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {image}
      </Link>
    );
  }

  // Not published yet
  return (
    <div
      className="relative"
      role="img"
      aria-label={`EasyBills on ${store} is coming soon`}
    >
      <div className="opacity-50 grayscale">{image}</div>
      <span className="absolute -right-2 -top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft">
        Coming soon
      </span>
    </div>
  );
}

export function DownloadSection() {
  return (
    <Section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl" />

      <div className="relative grid items-center gap-14 md:grid-cols-2">
        {/* Left: copy + downloads */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 px-3.5 py-1.5 text-xs font-semibold text-ink-700 dark:text-paper-200/80 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free on Android and iPhone
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Get EasyBills on your phone.
          </h1>

          <p className="mt-5 max-w-lg text-base text-ink-600 dark:text-paper-200/60 md:text-lg">
            Top up airtime, buy data, pay electricity and cable TV, and print your receipts
            from one wallet. Download the app and you can be paying bills in a minute.
          </p>

          {/* APK download */}
          <div className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={APK_URL} download>
                <Download className="h-4 w-4" /> Download APK for Android
              </a>
            </Button>
            <p className="mt-2.5 text-xs text-ink-600 dark:text-paper-200/50">
              {APK_VERSION} · {APK_SIZE} · Android 8.0 or newer
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3 text-xs text-ink-500 dark:text-paper-200/40">
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            or get it from the store
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          </div>

          {/* Store badges */}
          <div className="flex flex-wrap items-center gap-4">
            <StoreBadge
              href={PLAY_STORE_URL}
              src="/google-play-badge.png"
              alt="Get it on Google Play"
              width={1925}
              height={612}
              store="Google Play"
            />
            <StoreBadge
              href={APP_STORE_URL}
              src="/app-store-badge.png"
              alt="Download on the App Store"
              width={2000}
              height={595}
              store="the App Store"
            />
          </div>

          <div className="mt-9 flex items-center gap-1.5 text-xs text-ink-600 dark:text-paper-200/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Scanned and signed. Only install EasyBills from this page or the official stores.
          </div>
        </motion.div>

        {/* Right: phone preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[17rem]"
        >
          <div className="rounded-[2.5rem] border-[10px] border-ink-900 bg-paper-50 p-3 shadow-glow dark:border-ink-700 dark:bg-ink-950">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-ink-200 dark:bg-ink-700" />

            <NotchCard perforateAt="68%" className="bg-brand-mesh text-white shadow-glow">
              <div className="px-5 pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Wallet balance
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{formatNaira(84250.75)}</p>
                <p className="mt-1 text-xs text-white/50">Cashback: {formatNaira(1320.5)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 pb-4 pt-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold">
                  <Smartphone className="h-4 w-4 text-brand-200" /> Airtime
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold">
                  <Wifi className="h-4 w-4 text-brand-200" /> Data
                </div>
              </div>
            </NotchCard>

            <div className="mt-4 space-y-2 pb-2">
              {["MTN data 2GB", "IKEDC electricity", "DStv Compact"].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-[11px] font-semibold dark:border-ink-700 dark:bg-ink-850"
                >
                  <span>{label}</span>
                  <span className="text-emerald-600 dark:text-emerald-500">Paid</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Install steps (sequence, so numbering is meaningful) */}
      <div className="relative mt-20 md:mt-28">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Installing the APK on Android
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-600 dark:text-paper-200/60">
          Android asks for permission the first time you install an app from outside the Play
          Store. It takes under a minute.
        </p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {installSteps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-850"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-600 dark:text-paper-200/60">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}