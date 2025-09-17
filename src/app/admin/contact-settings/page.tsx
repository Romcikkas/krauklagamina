"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ContactSettings } from "../../../data/types";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "../../../lib/fetcher";

export default function ContactSettingsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Use SWR for contact settings
  const { data: settings, mutate } = useSWR<ContactSettings>(
    isAdmin ? "/api/contact-settings" : null,
    fetcher
  );

  const [formData, setFormData] = useState<ContactSettings>({
    defaultPhone: "",
    defaultEmail: "",
    defaultFacebook: "",
    defaultInstagram: "",
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Revalidate SWR cache
        mutate();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Klaida išsaugant nustatymus");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAdmin) {
    return <div>Kraunama...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Grįžti į admin panelę
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Kontaktų nustatymai
          </h1>
          <p className="text-gray-600 mt-2">
            Nustatykite numatytuosius kontaktų duomenis, kurie bus naudojami
            naujose kelionėse
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Nustatymai sėkmingai išsaugoti!
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefonas *
              </label>
              <input
                type="tel"
                name="defaultPhone"
                value={formData.defaultPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+370 600 12345"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                El. paštas *
              </label>
              <input
                type="email"
                name="defaultEmail"
                value={formData.defaultEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@krauklagamina.lt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook nuoroda
              </label>
              <input
                type="url"
                name="defaultFacebook"
                value={formData.defaultFacebook}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/krauklagamina"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram nuoroda
              </label>
              <input
                type="url"
                name="defaultInstagram"
                value={formData.defaultInstagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/krauklagamina"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Išsaugoma..." : "Išsaugoti nustatymus"}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-center"
            >
              Atšaukti
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
