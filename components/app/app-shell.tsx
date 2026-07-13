import { ReactNode } from "react";

import { AppChrome } from "@/components/app/app-chrome";
import { ConfigurationNotice } from "@/components/ui/configuration-notice";

export function AppShell({
  children,
  configurationMissing,
  profile,
}: {
  children: ReactNode;
  configurationMissing?: boolean;
  profile?: { full_name?: string | null; email?: string | null; subscription_plan?: string | null } | null;
}) {
  return (
    <AppChrome configurationMissing={configurationMissing} profile={profile}>
      {configurationMissing ? <ConfigurationNotice /> : null}
      {children}
    </AppChrome>
  );
}
