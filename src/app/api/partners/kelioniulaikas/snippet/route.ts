import { NextRequest, NextResponse } from "next/server";

type SnippetPayload = {
  slogan: string | null;
  note: string | null;
  countries: string[];
  cities: string[];
  amenities: string[];
  mapEmbedUrl: string | null;
};

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, { cachedAt: number; payload: SnippetPayload }>();

function decodeHtmlEntities(input: string) {
  return input
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripTags(input: string) {
  return decodeHtmlEntities(input).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirstByClass(html: string, className: string) {
  const re = new RegExp(
    `<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
    "i",
  );
  const m = html.match(re);
  return m ? stripTags(m[1]) : null;
}

function extractListTexts(html: string, listClass: string) {
  const listRe = new RegExp(
    `<ul[^>]+class=["'][^"']*\\b${listClass}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/ul>`,
    "i",
  );
  const listMatch = html.match(listRe);
  if (!listMatch) return [];
  const listHtml = listMatch[1];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const items: string[] = [];
  for (const li of listHtml.matchAll(liRe)) {
    const text = stripTags(li[1]);
    if (text) items.push(text);
  }
  return Array.from(new Set(items));
}

function sanitizeNoPartnerMentions(text: string) {
  return text
    .replace(/Kelionių\s+laikas/gi, "")
    .replace(/kelioniulaikas\.lt/gi, "")
    .replace(/www\.kelioniulaikas\.lt/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pageUrl = url.searchParams.get("url");

  if (!pageUrl || pageUrl.trim().length === 0) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const cacheKey = pageUrl.trim();
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(
      { status: "success", data: cached.payload },
      { headers: { "x-cache": "hit" } },
    );
  }

  try {
    const upstreamResponse = await fetch(cacheKey, {
      headers: {
        "User-Agent": "krauklagamina/1.0 (+https://krauklagamina.lt)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Remote responded with ${upstreamResponse.status}`);
    }

    const html = await upstreamResponse.text();

    const payload: SnippetPayload = {
      slogan: null,
      note: null,
      countries: [],
      cities: [],
      amenities: [],
      mapEmbedUrl: null,
    };

    const slogan = extractFirstByClass(html, "travel-slogan");
    payload.slogan = slogan ? sanitizeNoPartnerMentions(slogan) : null;

    const note = extractFirstByClass(html, "travel-note");
    payload.note = note ? sanitizeNoPartnerMentions(note) : null;

    payload.countries = extractListTexts(html, "countries-list").map(sanitizeNoPartnerMentions).filter(Boolean);
    payload.cities = extractListTexts(html, "cities-list").map(sanitizeNoPartnerMentions).filter(Boolean);

    // Amenities list is rendered as: <ul class="list-unstyled amenities row"> <li>...</li> ...
    payload.amenities = extractListTexts(html, "amenities")
      .map(sanitizeNoPartnerMentions)
      .filter(Boolean);

    // Map embed (google.com/maps/d/u/1/embed?...), best-effort
    const iframeMatch = html.match(
      /<iframe[^>]+src=["'](https?:\/\/www\.google\.com\/maps\/d\/u\/1\/embed\?[^"']+)["'][^>]*>/i,
    );
    payload.mapEmbedUrl = iframeMatch ? iframeMatch[1] : null;

    cache.set(cacheKey, { cachedAt: now, payload });

    return NextResponse.json(
      { status: "success", data: payload },
      { headers: { "x-cache": "miss" } },
    );
  } catch (error) {
    console.error("Failed to fetch kelioniulaikas snippet", error);
    return NextResponse.json(
      { error: "Nepavyko gauti kelionės informacijos" },
      { status: 502 },
    );
  }
}

