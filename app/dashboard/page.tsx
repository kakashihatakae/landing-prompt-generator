import { DashboardContent } from "./dashboard-content";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering to prevent static prerender issues with client components
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userEmail = data?.claims?.email as string | undefined;

  return <DashboardContent userEmail={userEmail} />;
}
