"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ZeroGActivityFeed } from "@/components/shared/ZeroGActivityFeed";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ZeroGActivityFeed />
      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 80 }}
        toastOptions={{
          style: {
            background: "rgba(15, 15, 35, 0.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(91, 110, 242, 0.3)",
            backdropFilter: "blur(16px)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#34d399", secondary: "transparent" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "transparent" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
