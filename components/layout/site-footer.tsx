import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Twitter, Instagram, Linkedin } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Become an Agent", href: "/become-an-agent" },
      { label: "Developer API", href: "/developer-api" },
      { label: "Admin Panel", href: "/admin" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Airtime & Data", href: "/services/airtime" },
      { label: "Electricity Bills", href: "/services/electricity" },
      { label: "Cable TV", href: "/services" },
      { label: "Exam Pins", href: "/services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "#faq" },
      { label: "Report an Issue", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-600 dark:text-paper-200/60">
              Fast, reliable bill payments for everyday Nigeria — airtime, data, electricity,
              cable, exams and more, in one app.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-paper-200/60 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-700 dark:text-paper-200/70 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200/60 dark:border-ink-700/60 pt-6 text-xs text-ink-500 dark:text-paper-200/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} EasyBills. All rights reserved.</p>
          <p>
            Designed &amp; Developed by <span className="font-semibold text-ink-700 dark:text-paper-200/70">SPOTWEB TECH</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
