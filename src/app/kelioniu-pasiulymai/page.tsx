"use client";

import TripCard from "../components/TripCard";
import ErrorMessage from "../components/ErrorMessage";
import { Trip } from "../../data/types";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";

export default function KelioniuPasiulymai() {
  // Use SWR for trips data
  const {
    data: trips = [],
    isLoading,
    error,
  } = useSWR<Trip[]>("/api/trips", fetcher);

  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  return (
    <div>
      {/* Hero Section - Full Width */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Kelionių pasiūlymai
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Raskite savo idealią kelionę iš mūsų kruopščiai parinktų pasiūlymų
            </p>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-14 w-full">
        <div className="py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Kraunamos kelionės...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Kelionių nėra</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
