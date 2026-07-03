// Lightweight client-side translator that walks visible text nodes and
// translates them via the free MyMemory API. Caches results in localStorage
// so a language persists across reloads without hitting the API again.

const CACHE_PREFIX = "site.trans.";
const ORIGINAL_ATTR = "data-orig-text";

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
    /* quota exceeded – ignore */
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
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

async function translateText(text: string, lang: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|${encodeURIComponent(lang)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("translate failed");
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  return data.responseData?.translatedText || text;
}

let currentRun = 0;

export async function applyLanguage(lang: string) {
  const run = ++currentRun;

  // Restore originals first
  document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTR}]`).forEach((el) => {
    const orig = el.getAttribute(ORIGINAL_ATTR);
    if (orig !== null) el.textContent = orig;
    el.removeAttribute(ORIGINAL_ATTR);
  });

  document.documentElement.lang = lang;
  if (!lang || lang === "en") return;

  const cache = loadCache(lang);
  const nodes = collectTextNodes(document.body);

  // Apply cached translations synchronously
  const toFetch: { node: Text; text: string }[] = [];
  for (const node of nodes) {
    const original = node.nodeValue ?? "";
    const trimmed = original.trim();
    if (!trimmed) continue;
    const cached = cache[trimmed];
    const parent = node.parentElement;
    if (parent && !parent.hasAttribute(ORIGINAL_ATTR)) {
      parent.setAttribute(ORIGINAL_ATTR, parent.textContent ?? "");
    }
    if (cached) {
      node.nodeValue = original.replace(trimmed, cached);
    } else {
      toFetch.push({ node, text: trimmed });
    }
  }

  // Deduplicate strings before fetching
  const unique = Array.from(new Set(toFetch.map((t) => t.text)));
  const results: Record<string, string> = {};
  const CONCURRENCY = 4;
  let index = 0;

  async function worker() {
    while (index < unique.length) {
      if (run !== currentRun) return;
      const i = index++;
      const text = unique[i];
      try {
        results[text] = await translateText(text, lang);
      } catch {
        results[text] = text;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  if (run !== currentRun) return;

  for (const { node, text } of toFetch) {
    const translated = results[text];
    if (translated && node.nodeValue) {
      node.nodeValue = node.nodeValue.replace(text, translated);
      cache[text] = translated;
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
