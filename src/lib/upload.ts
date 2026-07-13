import { supabase } from "@/integrations/supabase/client";

// Long-lived signed URL so the URL keeps working even though the bucket is private.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (signErr || !data) throw signErr ?? new Error("Failed to sign uploaded file");
  return data.signedUrl;
}
