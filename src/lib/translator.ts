// Fast, batched client-side translator with persistent cache and a
// MutationObserver that translates newly-added text without spamming the API.

const CACHE_PREFIX = "site.trans.";
const SEP = "\n@@LT@@\n";
const originalTextByNode = new WeakMap<Text, string>();
const translatedByNode = new WeakMap<Text, string>();

type Cache = Record<string, string>;
const memCache: Record<string, Cache> = {};

function loadCache(lang: string): Cache {
  if (memCache[lang]) return memCache[lang];
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + lang);
    memCache[lang] = raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    memCache[lang] = {};
  }
  return memCache[lang];
}
let saveTimer: number | null = null;
function scheduleSave(lang: string) {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(memCache[lang] || {}));
    } catch { /* quota – ignore */ }
  }, 400);
}

function shouldSkip(parent: Element | null): boolean {
  if (!parent) return true;
  const tag = parent.tagName;
  if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT"].includes(tag)) return true;
  if (parent.closest("[data-no-translate]")) return true;
  if (parent.closest('[translate="no"]')) return true;
  return false;
}

function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node.parentElement)) return NodeFilter.FILTER_REJECT;
      // Skip pure numbers / punctuation-only nodes
      if (/^[\d\s.,:;!?/\-+=%$€£¥()[\]{}]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

function restoreAll() {
  const nodes = collectTextNodes(document.body);
  for (const node of nodes) {
    const original = originalTextByNode.get(node);
    if (original !== undefined) node.nodeValue = original;
  }
}

async function batchTranslate(texts: string[], lang: string): Promise<string[]> {
  const CHUNK_LIMIT = 1500;
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

  const reCase = (src: string, out: string): string => {
    if (!out) return src;
    if (src === src.toUpperCase() && src.toLowerCase() !== src.toUpperCase()) return out.toUpperCase();
    return out;
  };

  await Promise.all(
    chunks.map(async (chunk) => {
      // Send lowercased text so Google actually translates short uppercase words like "JUST".
      const joined = chunk.map((c) => c.t.toLowerCase()).join(SEP);
      const url =
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(joined)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("translate failed");
        const data = (await res.json()) as unknown[];
        const segs = (data?.[0] as unknown[]) || [];
        const translated = segs.map((s) => (Array.isArray(s) ? String(s[0] ?? "") : "")).join("");
        const parts = translated.split(SEP);
        if (parts.length !== chunk.length) {
          for (const c of chunk) results[c.i] = c.t;
          return;
        }
        for (let k = 0; k < chunk.length; k++) {
          const src = chunk[k].t;
          const out = parts[k].trim();
          results[chunk[k].i] = out ? reCase(src, out) : src;
        }
      } catch {
        for (const c of chunk) results[c.i] = c.t;
      }
    })
  );
  return results;
}

let currentLang = "en";
let currentRun = 0;
let observer: MutationObserver | null = null;
let scanTimer: number | null = null;

function applyToNode(node: Text, lang: string, cache: Cache): string | null {
  const original = node.nodeValue ?? "";
  const trimmed = original.trim();
  if (!trimmed) return null;
  if (!originalTextByNode.has(node)) originalTextByNode.set(node, original);
  const cached = cache[trimmed];
  if (cached) {
    const next = original.replace(trimmed, cached);
    if (node.nodeValue !== next) node.nodeValue = next;
    translatedByNode.set(node, cached);
    return null;
  }
  return trimmed;
}

async function translateMissing(missing: { node: Text; text: string }[], lang: string) {
  if (missing.length === 0) return;
  const cache = loadCache(lang);
  const uniqueTexts = Array.from(new Set(missing.map((m) => m.text)));
  const translated = await batchTranslate(uniqueTexts, lang);
  if (lang !== currentLang) return;
  const map: Record<string, string> = {};
  uniqueTexts.forEach((t, i) => (map[t] = translated[i]));
  for (const { node, text } of missing) {
    const t = map[text];
    if (t && node.nodeValue) {
      node.nodeValue = node.nodeValue.replace(text, t);
      translatedByNode.set(node, t);
      cache[text] = t;
    }
  }
  scheduleSave(lang);
}

function scanAndTranslate() {
  if (currentLang === "en") return;
  const lang = currentLang;
  const cache = loadCache(lang);
  const nodes = collectTextNodes(document.body);
  const missing: { node: Text; text: string }[] = [];
  for (const node of nodes) {
    // Skip nodes we've already translated to their current target
    const existing = translatedByNode.get(node);
    if (existing && node.nodeValue?.includes(existing)) continue;
    const need = applyToNode(node, lang, cache);
    if (need) missing.push({ node, text: need });
  }
  if (missing.length) void translateMissing(missing, lang);
}

function scheduleScan() {
  if (scanTimer) window.clearTimeout(scanTimer);
  scanTimer = window.setTimeout(scanAndTranslate, 200);
}

function ensureObserver() {
  if (observer) return;
  observer = new MutationObserver(() => {
    if (currentLang === "en") return;
    scheduleScan();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

export async function applyLanguage(lang: string) {
  const run = ++currentRun;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  if (!lang || lang === "en") {
    restoreAll();
    return;
  }

  ensureObserver();
  const cache = loadCache(lang);
  const nodes = collectTextNodes(document.body);
  const missing: { node: Text; text: string }[] = [];
  for (const node of nodes) {
    const need = applyToNode(node, lang, cache);
    if (need) missing.push({ node, text: need });
  }
  if (run !== currentRun) return;
  await translateMissing(missing, lang);
}

export function getStoredLang(): string {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("site.lang") || "en";
}
export function setStoredLang(lang: string) {
  window.localStorage.setItem("site.lang", lang);
}
