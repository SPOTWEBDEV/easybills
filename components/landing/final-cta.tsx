"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <Section className="pb-20 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45 }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-6 py-14 text-center shadow-soft"
      >
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Your bills, sorted in seconds.
        </h2>
        <p className="max-w-md text-sm text-ink-600 dark:text-paper-200/60 md:text-base">
          Join thousands of Nigerians who trust EasyBills for airtime, data, and every recurring
          bill.
        </p>
        <Button asChild size="lg">
          <Link href="/register">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </Section>
  );
}
