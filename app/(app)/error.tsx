"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="grid place-items-center py-20 text-center">
      <AlertTriangle className="mb-3 h-10 w-10 text-[hsl(var(--warning))]" />
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred on this page. Your progress is safe. Try again, or head back to
        the dashboard.
      </p>
      <div className="mt-5 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
