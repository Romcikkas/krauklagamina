"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Trip, TripSettings } from "../../../data/types";
import Link from "next/link";
import TripCard from "../../components/TripCard";
import useSWR, { mutate } from "swr";
import { fetcher } from "../../../lib/fetcher";

export default function ManageTrips() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [savingToggle, setSavingToggle] = useState<"bus" | "fly" | "gruda" | null>(null);

  // Use SWR for trips data
  const { data: trips = [], isLoading: tripsLoading } = useSWR<Trip[]>(
    isAdmin ? "/api/trips" : null,
    fetcher,
  );

  const {
    data: tripSettings,
    isLoading: settingsLoading,
    error: settingsError,
    mutate: mutateTripSettings,
  } = useSWR<TripSettings>(isAdmin ? "/api/trip-settings" : null, fetcher);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [isAdmin, router]);

  const persistSettings = async (
    nextSettings: TripSettings,
    toggle: "bus" | "fly" | "gruda",
  ) => {
    setSavingToggle(toggle);
    try {
      const response = await fetch("/api/trip-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to update trip settings");
      }

      await mutateTripSettings();
      return true;
    } catch (error) {
      console.error("Error updating trip settings:", error);
      alert("Nepavyko atnaujinti kelionių nustatymų");
      return false;
    } finally {
      setSavingToggle(null);
    }
  };

  const handleToggleBusTrips = async () => {
    if (!tripSettings) {
      return;
    }

    const nextSettings: TripSettings = {
      ...tripSettings,
      showBusTrips: !tripSettings.showBusTrips,
    };

    const ok = await persistSettings(nextSettings, "bus");
    if (ok) {
      alert(
        nextSettings.showBusTrips
          ? "Autobuso kelionės bus rodomos pasiūlymuose"
          : "Autobuso kelionės paslėptos nuo pasiūlymų",
      );
    }
  };

  const handleToggleFlyTrips = async () => {
    if (!tripSettings) {
      return;
    }

    const nextSettings: TripSettings = {
      ...tripSettings,
      showFlyTrips: !tripSettings.showFlyTrips,
    };

    const ok = await persistSettings(nextSettings, "fly");
    if (ok) {
      alert(
        nextSettings.showFlyTrips
          ? "Skrydžių kelionės bus rodomos pasiūlymuose"
          : "Skrydžių kelionės paslėptos nuo pasiūlymų",
      );
    }
  };

  const handleToggleGrudaWidget = async () => {
    if (!tripSettings) {
      return;
    }

    const nextSettings: TripSettings = {
      ...tripSettings,
      showGrudaWidget: !tripSettings.showGrudaWidget,
    };

    const ok = await persistSettings(nextSettings, "gruda");
    if (ok) {
      alert(
        nextSettings.showGrudaWidget
          ? "Gruda.lt pasiūlymai bus rodomi puslapyje"
          : "Gruda.lt pasiūlymai paslėpti nuo puslapio",
      );
    }
  };

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
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Kelioniulaikas.lt integracija
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Autobuso kelionių pasiūlymai
                </h2>
                <p className="mt-2 text-gray-600">
                  Įjungus bus rodoma kelioniulaikas.lt pasiūlymų skiltis
                  puslapyje „Kelionių pasiūlymai“.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      tripSettings?.showBusTrips
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {settingsLoading
                    ? "Tikrinama..."
                    : tripSettings?.showBusTrips
                      ? "Šiuo metu rodoma"
                      : "Šiuo metu nerodoma"}
                </div>
              </div>
              <button
                onClick={handleToggleBusTrips}
                disabled={
                  settingsLoading || !tripSettings || savingToggle === "bus"
                }
                className={`rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors ${
                  tripSettings?.showBusTrips
                    ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                    : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                }`}
              >
                {savingToggle === "bus"
                  ? "Saugoma..."
                  : tripSettings?.showBusTrips
                    ? "Išjungti rodymą"
                    : "Įjungti rodymą"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Kelioniulaikas.lt integracija
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Skrydžių kelionių pasiūlymai
                </h2>
                <p className="mt-2 text-gray-600">
                  Valdykite kelioniulaikas.lt skrydžių pasiūlymų
                  (list-fly-educational) rodymą svetainėje.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      tripSettings?.showFlyTrips
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {settingsLoading
                    ? "Tikrinama..."
                    : tripSettings?.showFlyTrips
                      ? "Šiuo metu rodoma"
                      : "Šiuo metu nerodoma"}
                </div>
              </div>
              <button
                onClick={handleToggleFlyTrips}
                disabled={
                  settingsLoading || !tripSettings || savingToggle === "fly"
                }
                className={`rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors ${
                  tripSettings?.showFlyTrips
                    ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                    : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                }`}
              >
                {savingToggle === "fly"
                  ? "Saugoma..."
                  : tripSettings?.showFlyTrips
                    ? "Išjungti rodymą"
                    : "Įjungti rodymą"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Partnerio widgetas
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Gruda.lt iframe rodymas
                </h2>
                <p className="mt-2 text-gray-600">
                  Valdykite gruda.lt pasiūlymų bloką puslapyje „Kelionių pasiūlymai“.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      tripSettings?.showGrudaWidget
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {settingsLoading
                    ? "Tikrinama..."
                    : tripSettings?.showGrudaWidget
                      ? "Šiuo metu rodoma"
                      : "Šiuo metu nerodoma"}
                </div>
              </div>
              <button
                onClick={handleToggleGrudaWidget}
                disabled={
                  settingsLoading || !tripSettings || savingToggle === "gruda"
                }
                className={`rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors ${
                  tripSettings?.showGrudaWidget
                    ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                    : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                }`}
              >
                {savingToggle === "gruda"
                  ? "Saugoma..."
                  : tripSettings?.showGrudaWidget
                    ? "Išjungti rodymą"
                    : "Įjungti rodymą"}
              </button>
            </div>
          </div>
        </div>

        {settingsError && (
          <p className="mb-10 text-sm text-red-600">
            Nepavyko nuskaityti nustatymų. Perkraukite puslapį.
          </p>
        )}

        {tripsLoading ? (
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
