import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type Feature =
  | "analytics"
  | "api"
  | "support"
  | "priority_support"
  | "sso"
  | "custom_integrations"
  | "unlimited_projects"
  | "unlimited_team";

export const PLAN_FEATURES: Record<string, Feature[]> = {
  starter: ["analytics", "support"],
  pro: [
    "analytics",
    "api",
    "support",
    "priority_support",
    "custom_integrations",
    "unlimited_projects",
  ],
  enterprise: [
    "analytics",
    "api",
    "support",
    "priority_support",
    "sso",
    "custom_integrations",
    "unlimited_projects",
    "unlimited_team",
  ],
};

export function getPlanFeatures(productName: string): Feature[] {
  const key = productName.toLowerCase().split(" ")[0];
  return PLAN_FEATURES[key] ?? [];
}

export function planHasFeature(productName: string, feature: Feature): boolean {
  return getPlanFeatures(productName).includes(feature);
}

export async function hasAccess(userId: string, feature: Feature): Promise<boolean> {
  const db = getSupabaseAdmin();

  const { data: subscription } = await db
    .from("subscriptions")
    .select("product_name, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (subscription) {
    return planHasFeature(subscription.product_name, feature);
  }

  return false;
}
