"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  searchKeys,
  searchPlaceholder = "Search...",
  pageSize = 8,
  toolbar,
}: {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="overflow-hidden p-0">
      {(searchKeys || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-ink-100 dark:border-ink-700 p-4 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys && (
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder={searchPlaceholder}
                leftIcon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink-100 dark:border-ink-700 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Inbox className="h-8 w-8 text-ink-300 dark:text-paper-200/20" />
                    <p className="text-sm text-ink-500 dark:text-paper-200/40">No records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-ink-50 dark:border-ink-800/60 last:border-0 hover:bg-ink-50/60 dark:hover:bg-ink-800/40"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`whitespace-nowrap px-4 py-3 ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-ink-100 dark:border-ink-700 px-4 py-3">
          <p className="text-xs text-ink-500 dark:text-paper-200/40">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-semibold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
