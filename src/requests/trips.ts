import { Trip } from "../data/types";

// Base API URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface TripsResponse {
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
}

export interface TripFilters {
  destination?: string;
  priceMin?: number;
  priceMax?: number;
  duration?: number;
  category?: string;
  page?: number;
  limit?: number;
}

// Get all trips with optional filtering
export const getTrips = async (
  filters?: TripFilters
): Promise<TripsResponse> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/trips${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.statusText}`);
  }

  return response.json();
};

// Get single trip by ID
export const getTripById = async (id: string): Promise<Trip> => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trip: ${response.statusText}`);
  }

  return response.json();
};

// Get featured trips
export const getFeaturedTrips = async (): Promise<Trip[]> => {
  const response = await fetch(`${API_BASE_URL}/trips/featured`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch featured trips: ${response.statusText}`);
  }

  return response.json();
};

// Search trips
export const searchTrips = async (query: string): Promise<Trip[]> => {
  const response = await fetch(
    `${API_BASE_URL}/trips/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search trips: ${response.statusText}`);
  }

  return response.json();
};
