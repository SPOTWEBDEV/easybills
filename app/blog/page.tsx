"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Section } from "@/components/shared/section";
import { Pagination } from "@/components/shared/pagination";
import { blogApi } from "@/lib/api/blog";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["public-blog", page],
    queryFn: () => blogApi.list(page, 9),
  });

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main>
        <Section className="py-16 md:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Blog</h1>
            <p className="mt-3 text-ink-600 dark:text-paper-200/60">
              Product updates, guides, and news from EasyBills.
            </p>
          </div>

          <div className="mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
                ))}
              </div>
            ) : !data || data.data.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink-500 dark:text-paper-200/40">
                No posts published yet — check back soon.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {data.data.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex flex-col rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-6 shadow-soft transition-all hover:-translate-y-1"
                    >
                      <h2 className="font-display text-lg font-semibold leading-snug">{post.title}</h2>
                      <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-paper-200/60">{post.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-paper-200/40">
                        <span>{post.author}</span>
                        <span>{post.publishedAt ? formatDate(post.publishedAt) : ""}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-10">
                  <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}