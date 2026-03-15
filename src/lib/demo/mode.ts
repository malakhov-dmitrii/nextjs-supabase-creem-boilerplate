const PLACEHOLDER_URLS = ["", "https://your-project.supabase.co", "your-supabase-url"];

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return PLACEHOLDER_URLS.includes(url);
}
