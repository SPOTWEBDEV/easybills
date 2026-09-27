"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Section } from "@/components/shared/section";
import { blogApi } from "@/lib/api/blog";
import { formatDate } from "@/lib/utils";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogApi.getBySlug(slug),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main>
        <Section className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
            >
              <ChevronLeft className="h-4 w-4" /> Back to blog
            </Link>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-8 w-3/4 animate-pulse rounded-lg bg-ink-100 dark:bg-ink-800" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-ink-100 dark:bg-ink-800" />
                <div className="h-64 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
              </div>
            ) : isError || !post ? (
              <div className="py-12 text-center">
                <p className="text-sm text-ink-500 dark:text-paper-200/40">
                  This post doesn&apos;t exist or hasn&apos;t been published yet.
                </p>
              </div>
            ) : (
              <article>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-ink-500 dark:text-paper-200/40">
                  <span>{post.author}</span>
                  <span>&middot;</span>
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : ""}</span>
                  <span>&middot;</span>
                  <span>{post.views.toLocaleString()} views</span>
                </div>
                <div className="prose prose-sm dark:prose-invert mt-8 max-w-none text-ink-700 dark:text-paper-200/70">
                  {post.content.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}