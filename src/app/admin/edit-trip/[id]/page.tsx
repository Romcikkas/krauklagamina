"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Trip, BadgeType } from "../../../../data/types";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "../../../../lib/fetcher";

export default function EditTrip() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Use SWR for trip data
  const { data: trip, isLoading: loadingTrip } = useSWR<Trip>(
    tripId ? `/api/trips/${tripId}` : null,
    fetcher
  );

  // Use SWR for contact settings - currently not used in edit page
  // const { data: contactSettings } = useSWR<ContactSettings>(
  //   isAdmin ? "/api/contact-settings" : null,
  //   fetcher
  // );

  // Form state
  const [formData, setFormData] = useState<Omit<Trip, "id">>({
    destination: "",
    date: "",
    duration: "",
    hotelName: "",
    hotelStars: 0,
    rating: 0,
    category: "",
    description: "",
    currentPrice: 0,
    originalPrice: undefined,
    image: "",
    badges: [],
    additionalFeatures: [],
    flightInfo: "Iš Vilniaus oro uosto",
    baggage: "20kg registruotas bagažas",
    busTravel: "",
    insurance: "Kelionių draudimas įskaičiuotas",
    phoneNumber: "",
    email: "",
    facebook: "",
    instagram: "",
  });

  // Update form when trip data loads
  useEffect(() => {
    if (trip) {
      setFormData({
        destination: trip.destination || "",
        date: trip.date || "",
        duration: trip.duration || "",
        hotelName: trip.hotelName || "",
        hotelStars: trip.hotelStars || 0,
        rating: trip.rating || 0,
        category: trip.category || "",
        description: trip.description || "",
        currentPrice: trip.currentPrice || 0,
        originalPrice: trip.originalPrice,
        image: trip.image || "",
        badges: trip.badges || [],
        additionalFeatures: trip.additionalFeatures || [],
        flightInfo: trip.flightInfo || "Iš Vilniaus oro uosto",
        baggage: trip.baggage || "20kg registruotas bagažas",
        busTravel: trip.busTravel || "",
        insurance: trip.insurance || "Kelionių draudimas įskaičiuotas",
        phoneNumber: trip.phoneNumber || "",
        email: trip.email || "",
        facebook: trip.facebook || "",
        instagram: trip.instagram || "",
      });

      // Set image preview if exists
      if (trip.image) {
        setImagePreview(trip.image);
      }
    }
  }, [trip]);

  if (!isAdmin) {
    router.push("/admin/login");
    return <div>Kraunama...</div>;
  }

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Kraunama kelionė...</p>
        </div>
      </div>
    );
  }

  // Image compression function
  const compressImage = (
    file: File,
    maxSizeKB: number = 80
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(""); // Return empty string on server
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.createElement("img");

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until size is acceptable
        let quality = 0.9;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Check size and reduce quality if needed
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          // 1.37 is base64 overhead
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file, 80); // 80KB limit
      setFormData((prev) => ({ ...prev, image: compressedImage }));
      setImagePreview(compressedImage);
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Klaida spaudžiant nuotrauką");
    }
  };

  const badgeOptions: { value: BadgeType; label: string }[] = [
    { value: "dienos-kaina", label: "Dienos kaina" },
    { value: "egzotine-kelione", label: "Egzotinė kelionė" },
    { value: "paskutine-minute", label: "Paskutinė minutė" },
    { value: "Populiarus", label: "Populiarus" },
    { value: "viskas-iskaiciuota", label: "Viskas įskaičiuota" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleBadgeChange = (badge: BadgeType, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      badges: checked
        ? [...prev.badges, badge]
        : prev.badges.filter((b) => b !== badge),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalFeatures:
        prev.additionalFeatures?.map((feature, i) =>
          i === index ? value : feature
        ) || [],
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      additionalFeatures: [...(prev.additionalFeatures || []), ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalFeatures:
        prev.additionalFeatures?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/trips?id=${tripId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update trip");
      }

      const result = await response.json();
      console.log("Kelionė sėkmingai atnaujinta:", result.trip);

      setSuccess(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Klaida atnaujinant kelionę:", error);
      setIsLoading(false);
      alert("Klaida atnaujinant kelionę. Bandykite dar kartą.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Sėkmė!</h2>
          <p className="text-gray-600 mb-6">Kelionė sėkmingai atnaujinta</p>
          <div className="space-y-3">
            <Link
              href="/admin/manage-trips"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center"
            >
              Grįžti į valdymą
            </Link>
            <Link
              href="/admin"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-center"
            >
              Grįžti į admin panelį
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Redaguoti kelionę
            </h1>
            <Link
              href="/admin/manage-trips"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Grįžti į valdymą
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          {/* Pagrindinė informacija */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelionės kryptis *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pvz. Turkija"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pvz. 2025 rugsėjo 17-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trukmė *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pvz. 7 n."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Viešbučio pavadinimas
              </label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pvz. Aroma Butik Hotel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Žvaigždutės
              </label>
              <select
                name="hotelStars"
                value={formData.hotelStars}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Nėra žvaigždučių</option>
                <option value={1}>1 ⭐</option>
                <option value={2}>2 ⭐</option>
                <option value={3}>3 ⭐</option>
                <option value={4}>4 ⭐</option>
                <option value={5}>5 ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reitingas
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pasirinkite kategoriją</option>
                <option value="Standartinis">Standartinis</option>
                <option value="Aukštos klasės">Aukštos klasės</option>
                <option value="Prabangus">Prabangus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aprašymas
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Trumpas kelionės aprašymas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuotrauka
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nuotrauka bus suspausti iki ~80KB (neprivaloma - palikite
                tuščią, jei nenorite keisti)
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={128}
                    height={96}
                    className="object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kainos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dabartinė kaina € *
              </label>
              <input
                type="number"
                name="currentPrice"
                value={formData.currentPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="285"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Originali kaina € (nuolaida)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="320"
              />
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ženkleliai
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badgeOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.badges.includes(option.value)}
                    onChange={(e) =>
                      handleBadgeChange(option.value, e.target.checked)
                    }
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Papildomi patogumai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Papildomi patogumai
            </label>
            <div className="space-y-2">
              {formData.additionalFeatures?.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Įveskite patogumą"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                + Pridėti patogumą
              </button>
            </div>
          </div>

          {/* Kontaktų informacija */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono numeris
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+370 600 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                El. paštas
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@krauklagamina.lt"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook nuoroda
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook || ""}
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
                name="instagram"
                value={formData.instagram || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/krauklagamina"
              />
            </div>
          </div>

          {/* Skrydžiai, Bagažas ir Autobusas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skrydis
              </label>
              <input
                type="text"
                name="flightInfo"
                value={formData.flightInfo || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Iš Vilniaus oro uosto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bagažas
              </label>
              <input
                type="text"
                name="baggage"
                value={formData.baggage || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20kg registruotas bagažas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelionė autobusu
              </label>
              <input
                type="text"
                name="busTravel"
                value={formData.busTravel || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Išvykimas iš Vilniaus"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Atnaujinama..." : "Atnaujinti kelionę"}
            </button>
            <Link
              href="/admin/manage-trips"
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
