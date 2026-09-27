"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgb(var(--bg-elevated))",
              color: "rgb(var(--fg))",
              border: "1px solid rgb(var(--border))",
              borderRadius: "1rem",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
