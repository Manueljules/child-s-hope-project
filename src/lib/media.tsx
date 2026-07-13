import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const cache = new Map<string, string>();

/**
 * Turns a Supabase Storage URL into one that actually loads.
 * - Public URLs against private buckets: re-signs them.
 * - Already-signed URLs: returned as-is.
 * - Anything else: returned as-is.
 */
export async function resolveMediaUrl(url: string | null | undefined): Promise<string> {
  if (!url) return "";
  if (cache.has(url)) return cache.get(url)!;
  const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) { cache.set(url, url); return url; }
  const bucket = m[1];
  const path = decodeURIComponent(m[2].split("?")[0]);
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  const out = data?.signedUrl ?? url;
  cache.set(url, out);
  return out;
}

export function useResolvedUrl(url: string | null | undefined): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return "";
    // If already signed or not a Supabase storage URL, use immediately to avoid flicker.
    if (!/\/storage\/v1\/object\/public\//.test(url)) return url;
    return cache.get(url) ?? "";
  });
  useEffect(() => {
    let alive = true;
    resolveMediaUrl(url).then((v) => { if (alive) setResolved(v); });
    return () => { alive = false; };
  }, [url]);
  return resolved;
}

export function M(
  props: { src: string | null | undefined } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">,
) {
  const { src, ...rest } = props;
  const resolved = useResolvedUrl(src);
  if (!resolved) return <div aria-hidden className={rest.className} />;
  return <img src={resolved} {...rest} />;
}

export function V(
  props: { src: string | null | undefined } & Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src">,
) {
  const { src, ...rest } = props;
  const resolved = useResolvedUrl(src);
  if (!resolved) return <div aria-hidden className={rest.className} />;
  return <video src={resolved} {...rest} />;
}
