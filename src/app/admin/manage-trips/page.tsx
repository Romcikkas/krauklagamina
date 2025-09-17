"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Trip } from "../../../data/types";
import Link from "next/link";
import TripCard from "../../components/TripCard";
import useSWR, { mutate } from "swr";
import { fetcher } from "../../../lib/fetcher";

export default function ManageTrips() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Use SWR for trips data
  const { data: trips = [], isLoading } = useSWR<Trip[]>(
    isAdmin ? "/api/trips" : null,
    fetcher
  );

  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [isAdmin, router]);

  const handleDelete = async (tripId: number) => {
    if (!confirm("Ar tikrai norite ištrinti šią kelionę?")) {
      return;
    }

    setDeleteLoading(tripId);
    try {
      const response = await fetch(`/api/trips?id=${tripId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Revalidate the SWR cache to refresh data
        mutate("/api/trips");
        alert("Kelionė sėkmingai ištrinta!");
      } else {
        alert("Klaida trinant kelionę");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Klaida trinant kelionę");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!isAdmin) {
    return <div>Kraunama...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Valdyti keliones
              </h1>
              <p className="text-xl text-gray-600">
                Redaguokite arba šalinkite kelionių pasiūlymus
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              ← Atgal į admin
            </Link>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Kraunamos kelionės...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Kelionių nėra</p>
            <Link
              href="/admin/add-trip"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Pridėti pirmą kelionę
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isAdmin={true}
                onDelete={handleDelete}
                onEdit={(id) => router.push(`/admin/edit-trip/${id}`)}
                deleteLoading={deleteLoading === trip.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
