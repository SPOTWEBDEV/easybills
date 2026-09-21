"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

const SUPPORT_EMAIL = "support@easybills-app.top";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject || "Message from the EasyBills website"
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <StaticPageShell
      eyebrow="Contact"
      title="Get in touch"
      description="Have a question, a partnership idea, or something to report? Send us a message and we'll get back to you."
      narrow={false}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-2">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's going on — include a transaction reference if it's about a specific purchase."
              className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600"
          >
            <Send className="h-4 w-4" />
            Send message
          </button>
          <p className="mt-3 text-xs text-ink-faint">
            This opens your email app with the message pre-filled, addressed to {SUPPORT_EMAIL}.
          </p>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <Mail className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">Email</h3>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1.5 block text-sm text-brand-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">In-app support</h3>
            <p className="mt-1.5 text-sm text-ink-faint">
              Already a customer? The in-app chat is usually the fastest way to get help.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <MapPin className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">Based in Nigeria</h3>
            <p className="mt-1.5 text-sm text-ink-faint">Built for everyday Nigeria, from the ground up.</p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
