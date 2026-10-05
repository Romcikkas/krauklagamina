import { NextRequest, NextResponse } from "next/server";

type ProgramImage = {
  full: string;
  thumb: string;
  alt: string | null;
};

type ProgramDayImages = {
  day: number;
  name: string | null;
  images: ProgramImage[];
};

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, { cachedAt: number; data: ProgramDayImages[] }>();

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
  return decodeHtmlEntities(input)
    .replace(/<[^>]*>/g, " ")
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
      { status: "success", data: cached.data },
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

    // Find program list items that contain "<b>1 DIENA</b>:"
    const liRe = /<li[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>[\s\S]*?<\/li>/gi;
    const days: ProgramDayImages[] = [];

    for (const li of html.matchAll(liRe)) {
      const liHtml = li[0];

      const headingMatch = liHtml.match(
        /<h2[^>]*>[\s\S]*?<b>\s*(\d+)\s*DIENA\s*<\/b>\s*:\s*([^<]+?)\s*<\/h2>/i,
      );
      if (!headingMatch) continue;

      const dayNum = Number(headingMatch[1]);
      if (!Number.isFinite(dayNum) || dayNum <= 0) continue;
      const name = stripTags(headingMatch[2]) || null;

      const images: ProgramImage[] = [];
      const aRe =
        /<a[^>]+href=["']([^"']+_large\.(?:jpg|jpeg|png|webp))["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+_grid\.(?:jpg|jpeg|png|webp))["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>[\s\S]*?<\/a>/gi;

      for (const a of liHtml.matchAll(aRe)) {
        const full = a[1];
        const thumb = a[2];
        const alt = a[3] ? stripTags(a[3]) : null;
        if (full && thumb) {
          images.push({ full, thumb, alt });
        }
      }

      if (images.length === 0) continue;

      // Deduplicate by full URL
      const deduped = images.filter(
        (img, idx, arr) => arr.findIndex((x) => x.full === img.full) === idx,
      );

      days.push({ day: dayNum, name, images: deduped });
    }

    // Sort by day number
    days.sort((a, b) => a.day - b.day);

    cache.set(cacheKey, { cachedAt: now, data: days });

    return NextResponse.json(
      { status: "success", data: days },
      { headers: { "x-cache": "miss" } },
    );
  } catch (error) {
    console.error("Failed to fetch kelioniulaikas program images", error);
    return NextResponse.json(
      { error: "Nepavyko gauti programos nuotraukų" },
      { status: 502 },
    );
  }
}

