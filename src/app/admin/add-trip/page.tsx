"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Trip, BadgeType, ContactSettings } from "../../../data/types";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "../../../lib/fetcher";

export default function AddTrip() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeLanguageTab, setActiveLanguageTab] = useState<
    "lt" | "en" | "pl"
  >("lt");

  // Use SWR for contact settings
  const { data: contactSettings } = useSWR<ContactSettings>(
    isAdmin ? "/api/contact-settings" : null,
    fetcher,
  );

  // Form state
  const [formData, setFormData] = useState<Omit<Trip, "id">>({
    destination: "",
    destinationLt: "",
    destinationEn: "",
    destinationPl: "",
    date: "",
    duration: "",
    hotelName: "",
    hotelStars: 0,
    rating: 0,
    category: "",
    description: "",
    descriptionLt: "",
    descriptionEn: "",
    descriptionPl: "",
    currentPrice: 0,
    originalPrice: undefined,
    image: "",
    badges: [],
    additionalFeatures: [],
    additionalFeaturesLt: [],
    additionalFeaturesEn: [],
    additionalFeaturesPl: [],
    flightInfo: "Iš Vilniaus oro uosto",
    flightInfoLt: "",
    flightInfoEn: "",
    flightInfoPl: "",
    baggage: "20kg registruotas bagažas",
    baggageLt: "",
    baggageEn: "",
    baggagePl: "",
    busTravel: "",
    busTravelLt: "",
    busTravelEn: "",
    busTravelPl: "",
    insurance: "Kelionių draudimas įskaičiuotas",
    phoneNumber: contactSettings?.defaultPhone || "",
    email: contactSettings?.defaultEmail || "",
    facebook: contactSettings?.defaultFacebook || "",
    instagram: contactSettings?.defaultInstagram || "",
  });

  // Update form data when contact settings load
  useEffect(() => {
    if (contactSettings) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: contactSettings.defaultPhone || "",
        email: contactSettings.defaultEmail || "",
        facebook: contactSettings.defaultFacebook || "",
        instagram: contactSettings.defaultInstagram || "",
      }));
    }
  }, [contactSettings]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [authLoading, isAdmin, router]);

  if (authLoading) {
    return <div>Kraunama...</div>;
  }

  if (!isAdmin) {
    return <div>Kraunama...</div>;
  }

  // Image compression function
  const compressImage = (
    file: File,
    maxSizeKB: number = 80,
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
    >,
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

  const handleFeatureChange = (
    index: number,
    value: string,
    lang: "Lt" | "En" | "Pl",
  ) => {
    const fieldName = `additionalFeatures${lang}` as keyof typeof formData;
    setFormData((prev) => ({
      ...prev,
      [fieldName]:
        (prev[fieldName] as string[])?.map((feature, i) =>
          i === index ? value : feature,
        ) || [],
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      additionalFeaturesLt: [...(prev.additionalFeaturesLt || []), ""],
      additionalFeaturesEn: [...(prev.additionalFeaturesEn || []), ""],
      additionalFeaturesPl: [...(prev.additionalFeaturesPl || []), ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalFeaturesLt:
        prev.additionalFeaturesLt?.filter((_, i) => i !== index) || [],
      additionalFeaturesEn:
        prev.additionalFeaturesEn?.filter((_, i) => i !== index) || [],
      additionalFeaturesPl:
        prev.additionalFeaturesPl?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ensure backward compatibility: set destination, description, flightInfo, baggage, busTravel and additionalFeatures to LT versions
      const submitData = {
        ...formData,
        destination: formData.destinationLt || formData.destination,
        description: formData.descriptionLt || formData.description,
        flightInfo: formData.flightInfoLt || formData.flightInfo,
        baggage: formData.baggageLt || formData.baggage,
        busTravel: formData.busTravelLt || formData.busTravel,
        additionalFeatures:
          formData.additionalFeaturesLt || formData.additionalFeatures,
      };

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to add trip");
      }

      const result = await response.json();
      console.log("Kelionė sėkmingai pridėta:", result.trip);

      setSuccess(true);
      setIsLoading(false);

      // Reset form
      setFormData({
        destination: "",
        destinationLt: "",
        destinationEn: "",
        destinationPl: "",
        date: "",
        duration: "",
        hotelName: "",
        hotelStars: 0,
        rating: 0,
        category: "",
        description: "",
        descriptionLt: "",
        descriptionEn: "",
        descriptionPl: "",
        currentPrice: 0,
        originalPrice: undefined,
        image: "",
        badges: [],
        additionalFeatures: [],
        additionalFeaturesLt: [],
        additionalFeaturesEn: [],
        additionalFeaturesPl: [],
        flightInfo: "Iš Vilniaus oro uosto",
        flightInfoLt: "",
        flightInfoEn: "",
        flightInfoPl: "",
        baggage: "20kg registruotas bagažas",
        baggageLt: "",
        baggageEn: "",
        baggagePl: "",
        busTravel: "",
        busTravelLt: "",
        busTravelEn: "",
        busTravelPl: "",
        insurance: "Kelionių draudimas įskaičiuotas",
        phoneNumber: contactSettings?.defaultPhone || "",
        email: contactSettings?.defaultEmail || "",
        facebook: contactSettings?.defaultFacebook || "",
        instagram: contactSettings?.defaultInstagram || "",
      });
      setImagePreview("");
    } catch {
      setIsLoading(false);
      alert("Klaida išsaugant kelionę. Bandykite dar kartą.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Sėkmė!</h2>
          <p className="text-gray-600 mb-6">Kelionė sėkmingai pridėta</p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Pridėti dar vieną kelionę
            </button>
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
              Pridėti naują kelionę
            </h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Grįžti į admin panelį
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
          {/* Language Switcher - Single location at top right of form */}
          <div className="flex justify-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveLanguageTab("lt")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeLanguageTab === "lt"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                🇱🇹 Lietuvių
              </button>
              <button
                type="button"
                onClick={() => setActiveLanguageTab("en")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeLanguageTab === "en"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => setActiveLanguageTab("pl")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeLanguageTab === "pl"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                🇵🇱 Polski
              </button>
            </div>
          </div>
          {/* Pagrindinė informacija */}
          {/* Kelionės kryptis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Kelionės kryptis
            </h3>

            {activeLanguageTab === "lt" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lietuvių kalba *
                </label>
                <input
                  type="text"
                  name="destinationLt"
                  value={formData.destinationLt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pvz. Turkija"
                  required
                />
              </div>
            )}

            {activeLanguageTab === "en" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anglų kalba
                </label>
                <input
                  type="text"
                  name="destinationEn"
                  value={formData.destinationEn || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Turkey"
                />
              </div>
            )}

            {activeLanguageTab === "pl" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lenkų kalba
                </label>
                <input
                  type="text"
                  name="destinationPl"
                  value={formData.destinationPl || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Turcja"
                />
              </div>
            )}
          </div>

          {/* Kita informacija */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="text"
                name="date"
                value={formData.date ?? ""}
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
                value={formData.duration ?? ""}
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
          </div>

          {/* Aprašymas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Aprašymas</h3>

            {activeLanguageTab === "lt" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lietuvių kalba
                </label>
                <textarea
                  name="descriptionLt"
                  value={formData.descriptionLt || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Trumpas kelionės aprašymas..."
                />
              </div>
            )}

            {activeLanguageTab === "en" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anglų kalba
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Brief trip description..."
                />
              </div>
            )}

            {activeLanguageTab === "pl" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lenkų kalba
                </label>
                <textarea
                  name="descriptionPl"
                  value={formData.descriptionPl || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Krótki opis wycieczki..."
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuotrauka *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nuotrauka bus suspausti iki ~80KB
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
                min="1"
                step="1"
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Papildomi patogumai
            </h3>
            <div className="space-y-6">
              {formData.additionalFeaturesLt?.map((_, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Patogumas #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      ✕ Ištrinti
                    </button>
                  </div>

                  {activeLanguageTab === "lt" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Lietuvių kalba *
                      </label>
                      <input
                        type="text"
                        value={formData.additionalFeaturesLt?.[index] || ""}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value, "Lt")
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="pvz. Baseinas su šildomu vandeniu"
                      />
                    </div>
                  )}

                  {activeLanguageTab === "en" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Anglų kalba
                      </label>
                      <input
                        type="text"
                        value={formData.additionalFeaturesEn?.[index] || ""}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value, "En")
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Heated swimming pool"
                      />
                    </div>
                  )}

                  {activeLanguageTab === "pl" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Lenkų kalba
                      </label>
                      <input
                        type="text"
                        value={formData.additionalFeaturesPl?.[index] || ""}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value, "Pl")
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="np. Basen z podgrzewaną wodą"
                      />
                    </div>
                  )}
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

          {/* Skrydis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Skrydžio informacija
            </h3>

            {activeLanguageTab === "lt" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lietuvių kalba
                </label>
                <input
                  type="text"
                  name="flightInfoLt"
                  value={formData.flightInfoLt || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Iš Vilniaus oro uosto"
                />
              </div>
            )}

            {activeLanguageTab === "en" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anglų kalba
                </label>
                <input
                  type="text"
                  name="flightInfoEn"
                  value={formData.flightInfoEn || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From Vilnius airport"
                />
              </div>
            )}

            {activeLanguageTab === "pl" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lenkų kalba
                </label>
                <input
                  type="text"
                  name="flightInfoPl"
                  value={formData.flightInfoPl || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Z lotniska w Wilnie"
                />
              </div>
            )}
          </div>

          {/* Bagažas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Bagažo informacija
            </h3>

            {activeLanguageTab === "lt" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lietuvių kalba
                </label>
                <input
                  type="text"
                  name="baggageLt"
                  value={formData.baggageLt || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20kg registruotas bagažas"
                />
              </div>
            )}

            {activeLanguageTab === "en" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anglų kalba
                </label>
                <input
                  type="text"
                  name="baggageEn"
                  value={formData.baggageEn || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20kg checked baggage"
                />
              </div>
            )}

            {activeLanguageTab === "pl" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lenkų kalba
                </label>
                <input
                  type="text"
                  name="baggagePl"
                  value={formData.baggagePl || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20kg bagażu rejestrowanego"
                />
              </div>
            )}
          </div>

          {/* Kelionė autobusu */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Kelionė autobusu
            </h3>

            {activeLanguageTab === "lt" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lietuvių kalba
                </label>
                <input
                  type="text"
                  name="busTravelLt"
                  value={formData.busTravelLt || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pvz. Išvykimas iš Vilniaus"
                />
              </div>
            )}

            {activeLanguageTab === "en" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anglų kalba
                </label>
                <input
                  type="text"
                  name="busTravelEn"
                  value={formData.busTravelEn || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Departure from Vilnius"
                />
              </div>
            )}

            {activeLanguageTab === "pl" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lenkų kalba
                </label>
                <input
                  type="text"
                  name="busTravelPl"
                  value={formData.busTravelPl || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Wyjazd z Wilna"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Išsaugoma..." : "Išsaugoti kelionę"}
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
