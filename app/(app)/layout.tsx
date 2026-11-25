import { AppShell } from "@/components/shell/app-shell";
import { RequireProfile } from "@/components/shell/require-profile";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireProfile>
      <AppShell>{children}</AppShell>
    </RequireProfile>
  );
}
