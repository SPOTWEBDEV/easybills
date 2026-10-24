import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DownloadSection } from "@/components/landing/download-section";

export const metadata: Metadata = {
  title: "Download EasyBills",
  description:
    "Get the EasyBills app on Android or iPhone. Pay bills, buy airtime and data, and more in one tap.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main>
        <DownloadSection />
      </main>
      <SiteFooter />
    </div>
  );
}