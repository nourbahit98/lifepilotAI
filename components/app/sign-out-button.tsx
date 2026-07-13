"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <Button
      aria-label="Uitloggen"
      className={cn("w-full gap-2 shadow-none", compact && "h-10 w-10 rounded-full px-0 py-0")}
      onClick={signOut}
      title="Uitloggen"
      type="button"
      variant="secondary"
    >
      <LogOut aria-hidden className="h-4 w-4" />
      {compact ? null : "Uitloggen"}
    </Button>
  );
}
