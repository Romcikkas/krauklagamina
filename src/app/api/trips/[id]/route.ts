import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Trip } from "../../../../data/types";

const dataFilePath = path.join(process.cwd(), "src/data/trips.json");

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = parseInt(params.id);

    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    // Read current trips
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const trips: Trip[] = JSON.parse(fileContents);

    // Find trip
    const trip = trips.find((trip) => trip.id === tripId);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error reading trip:", error);
    return NextResponse.json({ error: "Failed to read trip" }, { status: 500 });
  }
}
