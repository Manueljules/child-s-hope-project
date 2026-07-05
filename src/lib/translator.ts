// Fast, batched client-side translator. All visible text on the page is sent
// as ONE request per language switch (chunked only if it exceeds URL limits),
// then cached in localStorage so repeat visits are instant with zero lag.

const CACHE_PREFIX = "site.trans.";
const SEP = "\n@@LT@@\n"; // unique delimiter, unlikely to appear in copy
const originalTextByNode = new WeakMap<Text, string>();

type Cache = Record<string, string>;

function loadCache(lang: string): Cache {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + lang);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}
function saveCache(lang: string, cache: Cache) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(cache));
  } catch {
    /* quota – ignore */
  }
}

function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

function restoreAll() {
  document.querySelectorAll("*").forEach(() => {});
  const nodes = collectTextNodes(document.body);
  for (const node of nodes) {
    const original = originalTextByNode.get(node);
    if (original !== undefined) node.nodeValue = original;
  }
}

async function batchTranslate(texts: string[], lang: string): Promise<string[]> {
  // Google's free unofficial endpoint. Fast, no key needed.
  // We chunk by URL length to stay well under limits.
  const CHUNK_LIMIT = 1800; // chars of joined payload per request
  const results: string[] = new Array(texts.length);
  let buf: { i: number; t: string }[] = [];
  let bufLen = 0;
  const chunks: { i: number; t: string }[][] = [];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const add = t.length + SEP.length;
    if (bufLen + add > CHUNK_LIMIT && buf.length) {
      chunks.push(buf);
      buf = [];
      bufLen = 0;
    }
    buf.push({ i, t });
    bufLen += add;
  }
  if (buf.length) chunks.push(buf);

  await Promise.all(
    chunks.map(async (chunk) => {
      const joined = chunk.map((c) => c.t).join(SEP);
      const url =
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(joined)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("translate failed");
        const data = (await res.json()) as unknown[];
        // data[0] = array of [translatedSegment, originalSegment, ...]
        const segs = (data?.[0] as unknown[]) || [];
        const translated = segs.map((s) => (Array.isArray(s) ? String(s[0] ?? "") : "")).join("");
        const parts = translated.split(SEP);
        // If Google mangled the delimiter, fall back to originals for this chunk
        if (parts.length !== chunk.length) {
          for (const c of chunk) results[c.i] = c.t;
          return;
        }
        for (let k = 0; k < chunk.length; k++) results[chunk[k].i] = parts[k].trim() || chunk[k].t;
      } catch {
        for (const c of chunk) results[c.i] = c.t;
      }
    })
  );
  return results;
}

let currentRun = 0;

export async function applyLanguage(lang: string) {
  const run = ++currentRun;
  restoreAll();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (!lang || lang === "en") return;

  const cache = loadCache(lang);
  const nodes = collectTextNodes(document.body);

  // 1) Apply cached translations synchronously (this is what makes it feel instant)
  const missing: { node: Text; text: string }[] = [];
  for (const node of nodes) {
    const original = node.nodeValue ?? "";
    const trimmed = original.trim();
    if (!trimmed) continue;
    if (!originalTextByNode.has(node)) originalTextByNode.set(node, original);
    const cached = cache[trimmed];
    if (cached) {
      node.nodeValue = original.replace(trimmed, cached);
    } else {
      missing.push({ node, text: trimmed });
    }
  }

  if (missing.length === 0) return;

  // 2) Fetch only what's missing, in ONE batched call (chunked internally)
  const uniqueTexts = Array.from(new Set(missing.map((m) => m.text)));
  const translated = await batchTranslate(uniqueTexts, lang);
  if (run !== currentRun) return;

  const map: Record<string, string> = {};
  uniqueTexts.forEach((t, i) => (map[t] = translated[i]));

  for (const { node, text } of missing) {
    const t = map[text];
    if (t && node.nodeValue) {
      node.nodeValue = node.nodeValue.replace(text, t);
      cache[text] = t;
    }
  }
  saveCache(lang, cache);
}

export function getStoredLang(): string {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("site.lang") || "en";
}
export function setStoredLang(lang: string) {
  window.localStorage.setItem("site.lang", lang);
}
