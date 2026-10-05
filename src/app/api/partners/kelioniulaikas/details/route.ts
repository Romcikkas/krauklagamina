import { NextRequest, NextResponse } from "next/server";

const DEFAULT_DETAILS_URL = "https://www.kelioniulaikas.lt/api/travels/details";

type KelioniulaikasDetailsResponse =
  | { status: "success"; message: string | null; data: unknown }
  | { status: "failed"; message: string | null; data: null };

type CacheEntry = {
  payload: KelioniulaikasDetailsResponse;
  cachedAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id || id.trim().length === 0) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const cacheKey = id.trim();
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload, {
      headers: { "x-cache": "hit" },
    });
  }

  const upstreamUrl = `${DEFAULT_DETAILS_URL}?id=${encodeURIComponent(cacheKey)}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "krauklagamina/1.0 (+https://krauklagamina.lt)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Remote responded with ${upstreamResponse.status}`);
    }

    const payload =
      (await upstreamResponse.json()) as KelioniulaikasDetailsResponse;
    cache.set(cacheKey, { payload, cachedAt: now });

    return NextResponse.json(payload, {
      headers: { "x-cache": "miss" },
    });
  } catch (error) {
    console.error("Failed to fetch kelioniulaikas details", error);
    return NextResponse.json(
      { error: "Nepavyko gauti kelionės detalių" },
      { status: 502 },
    );
  }
}

