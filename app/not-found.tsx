import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 text-xl font-bold">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This path doesn't exist. Let's get you back on track.
        </p>
        <Link href="/dashboard" className="mt-5 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
