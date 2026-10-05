import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Trip } from "../../../../data/types";

const DEFAULT_SOURCE_URL =
  "https://www.kelioniulaikas.lt/api/travels/list-fly-educational";
const dataFilePath = path.join(
  process.cwd(),
  "src/data/list-fly-educational.json",
);
let cachedResponse: Trip[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

interface RemoteFlyTrip {
  id: number;
  name: string;
  transport_type?: string;
  travel_type?: string;
  countries?: string[];
  price: number;
  price_old?: number | null;
  url?: string;
  image_url?: string;
  thumbnail_url?: string;
}

interface RemoteFlyResponse {
  status?: string;
  message?: string | null;
  data?: RemoteFlyTrip[];
}

function normalizeFlyTrips(payload: RemoteFlyResponse | null): Trip[] {
  if (!payload || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data
    .filter((item) => typeof item.price === "number" && item.price > 0)
    .map<Trip>((item) => {
      const imageCandidate = item.thumbnail_url || item.image_url;

      return {
        id: item.id,
        destination: item.name,
        destinationLt: item.name,
        date: null,
        duration: null,
        category: item.travel_type || "Pažintinė kelionė",
        currentPrice: item.price,
        originalPrice:
          typeof item.price_old === "number" && item.price_old > item.price
            ? item.price_old
            : undefined,
        image:
          imageCandidate ||
          "https://www.kelioniulaikas.lt/files/2021-01/7171_large.jpg",
        badges: [],
        transportType: item.transport_type,
        travelType: item.travel_type,
        countries: item.countries,
        externalUrl: item.url,
        source: "fly",
      };
    });
}

async function readLocalFallback(): Promise<RemoteFlyResponse> {
  const fileContents = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(fileContents) as RemoteFlyResponse;
}

export async function GET() {
  const now = Date.now();
  if (cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse);
  }

  const sourceUrl = process.env.FLY_TRIPS_SOURCE_URL || DEFAULT_SOURCE_URL;

  try {
    const upstreamResponse = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "krauklagamina/1.0 (+https://krauklagamina.lt)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Remote responded with ${upstreamResponse.status}`);
    }

    const payload = (await upstreamResponse.json()) as RemoteFlyResponse;
    const normalized = normalizeFlyTrips(payload);
    cachedResponse = normalized;
    cacheTimestamp = now;

    await fs.writeFile(dataFilePath, JSON.stringify(payload, null, 2), "utf8");

    return NextResponse.json(normalized, {
      headers: { "x-data-source": "remote" },
    });
  } catch (error) {
    try {
      const fallbackRaw = await readLocalFallback();
      const normalized = normalizeFlyTrips(fallbackRaw);
      cachedResponse = normalized;
      cacheTimestamp = now;
      return NextResponse.json(normalized, {
        headers: { "x-data-source": "local" },
      });
    } catch (fallbackError) {
      console.error("Failed to deliver fly trips", error, fallbackError);
      return NextResponse.json(
        { error: "Nepavyko nuskaityti skrydžių kelionių" },
        { status: 500 },
      );
    }
  }
}
