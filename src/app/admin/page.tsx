"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Trip } from "../../data/types";
import { fetcher } from "../../lib/fetcher";
import useSWR from "swr";

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Use SWR for trips data
  const {
    data: trips = [],
    isLoading,
    error,
  } = useSWR<Trip[]>(isAdmin && !authLoading ? "/api/trips" : null, fetcher);

  useEffect(() => {
    if (authLoading) return; // Laukiame kol užsikraus auth

    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) {
    return <div>Kraunama...</div>;
  }

  if (error) {
    return <div>Klaida kraunant duomenis: {error.message}</div>;
  }

  if (!isAdmin) {
    return <div>Kraunama...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin valdymas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Valdykite kelionių pasiūlymus ir svetainės turinį
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pridėti kelionę */}
          {/* Pridėti kelionę */}
          <Link href="/admin/add-trip" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">➕</span>
                <h3 className="text-xl font-semibold">Pridėti kelionę</h3>
              </div>
              <p className="text-gray-600">
                Sukurkite naują kelionės pasiūlymą su visais duomenimis
              </p>
            </div>
          </Link>

          {/* Valdyti keliones */}
          <Link href="/admin/manage-trips" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">📝</span>
                <h3 className="text-xl font-semibold">Valdyti keliones</h3>
              </div>
              <p className="text-gray-600">
                Redaguokite arba pašalinkite esamus kelionių pasiūlymus
              </p>
            </div>
          </Link>

          {/* Kontaktų nustatymai */}
          <Link href="/admin/contact-settings" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">📞</span>
                <h3 className="text-xl font-semibold">Kontaktų nustatymai</h3>
              </div>
              <p className="text-gray-600">
                Nustatykite numatytuosius kontaktų duomenis kelionėms
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Greita apžvalga
            </h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : trips.length}
              </div>
              <div className="text-gray-600">Aktyvių kelionių</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
