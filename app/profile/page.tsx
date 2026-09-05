import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/auth/client";
import { ProfileClient } from "./ProfileClient";

export const revalidate = 0; // always fresh

export const metadata: Metadata = {
  title: "Profile — Movbox",
  description: "Your Movbox account and watch history.",
};

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Not signed in → bounce to /login?next=/profile
    redirect("/login?next=/profile");
  }
  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email ?? "",
        name:
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "Movbox user",
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        createdAt: user.created_at,
      }}
    />
  );
}
