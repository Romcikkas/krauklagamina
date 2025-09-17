import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Trip } from "../../../data/types";

const dataFilePath = path.join(process.cwd(), "src/data/trips.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const trips = JSON.parse(fileContents);
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error reading trips:", error);
    return NextResponse.json(
      { error: "Failed to read trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newTripData = await request.json();

    // Read current trips
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const trips: Trip[] = JSON.parse(fileContents);

    // Generate new ID (find max ID and add 1)
    const maxId =
      trips.length > 0 ? Math.max(...trips.map((trip) => trip.id)) : 0;
    const newTrip: Trip = {
      ...newTripData,
      id: maxId + 1,
    };

    // Add new trip
    trips.push(newTrip);

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(trips, null, 2), "utf8");

    return NextResponse.json({ success: true, trip: newTrip });
  } catch (error) {
    console.error("Error adding trip:", error);
    return NextResponse.json({ error: "Failed to add trip" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const tripId = parseInt(id);

    // Read current trips
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const trips: Trip[] = JSON.parse(fileContents);

    // Find trip index
    const tripIndex = trips.findIndex((trip) => trip.id === tripId);

    if (tripIndex === -1) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Remove trip from array
    trips.splice(tripIndex, 1);

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(trips, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const tripId = parseInt(id);
    const updatedTripData = await request.json();

    // Read current trips
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const trips: Trip[] = JSON.parse(fileContents);

    // Find trip index
    const tripIndex = trips.findIndex((trip) => trip.id === tripId);

    if (tripIndex === -1) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Update trip (preserve ID)
    trips[tripIndex] = {
      ...updatedTripData,
      id: tripId,
    };

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(trips, null, 2), "utf8");

    return NextResponse.json({ success: true, trip: trips[tripIndex] });
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}
