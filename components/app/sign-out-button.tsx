"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <Button className="w-full gap-2 shadow-none" onClick={signOut} type="button" variant="secondary">
      <LogOut aria-hidden className="h-4 w-4" />
      Uitloggen
    </Button>
  );
}
