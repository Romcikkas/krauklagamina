import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ContactSettings } from "../../../data/types";

const contactSettingsPath = path.join(
  process.cwd(),
  "src/data/contactSettings.json"
);

export async function GET() {
  try {
    const fileContents = await fs.readFile(contactSettingsPath, "utf8");
    const settings = JSON.parse(fileContents);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading contact settings:", error);
    return NextResponse.json(
      { error: "Failed to read contact settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newSettings: ContactSettings = await request.json();

    // Write settings to file
    await fs.writeFile(
      contactSettingsPath,
      JSON.stringify(newSettings, null, 2),
      "utf8"
    );

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Error updating contact settings:", error);
    return NextResponse.json(
      { error: "Failed to update contact settings" },
      { status: 500 }
    );
  }
}
