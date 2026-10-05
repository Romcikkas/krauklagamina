import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { TripSettings } from "../../../data/types";

const settingsFilePath = path.join(process.cwd(), "src/data/tripSettings.json");

function withDefaults(settings: Partial<TripSettings> | null): TripSettings {
  return {
    showBusTrips: settings?.showBusTrips ?? false,
    showFlyTrips: settings?.showFlyTrips ?? false,
    showGrudaWidget: settings?.showGrudaWidget ?? false,
  };
}

export async function GET() {
  try {
    const fileContents = await fs.readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(fileContents) as Partial<TripSettings>;
    return NextResponse.json(withDefaults(parsed));
  } catch (error) {
    console.error("Error reading trip settings:", error);
    return NextResponse.json(
      { error: "Failed to read trip settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newSettings = withDefaults(await request.json());

    await fs.writeFile(
      settingsFilePath,
      JSON.stringify(newSettings, null, 2),
      "utf8",
    );

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Error updating trip settings:", error);
    return NextResponse.json(
      { error: "Failed to update trip settings" },
      { status: 500 },
    );
  }
}
