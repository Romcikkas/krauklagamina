"use client";

import Image from "next/image";
import { useState } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Trip } from "../../data/types";

interface TripCardProps {
  trip: Trip;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  deleteLoading?: boolean;
}

export default function TripCard({
  trip,
  isAdmin = false,
  onDelete,
  onEdit,
  deleteLoading = false,
}: TripCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <span key={i} className="text-yellow-400 text-sm">
        ★
      </span>
    ));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <Image
            src={trip.image}
            alt={trip.destination}
            fill
            className="object-cover"
          />
          {/* Badges - Overlay on image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {trip.badges?.map((badge, index) => {
              const badgeConfig = {
                "egzotine-kelione": {
                  bg: "bg-emerald-500",
                  icon: "✨",
                  text: "Egzotinė kelionė",
                },
                "dienos-kaina": {
                  bg: "bg-red-500",
                  icon: "%",
                  text: "Dienos kaina",
                },
                "paskutine-minute": {
                  bg: "bg-orange-500",
                  icon: "⚡",
                  text: "Paskutinė minutė",
                },
                Populiarus: {
                  bg: "bg-purple-500",
                  icon: "🔥",
                  text: "Populiarus",
                },
                "viskas-iskaiciuota": {
                  bg: "bg-blue-500",
                  icon: "🍽️",
                  text: "Viskas įskaičiuota",
                },
              };

              const config = badgeConfig[badge];
              return (
                <div
                  key={index}
                  className={`${config.bg} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                >
                  <span>{config.icon}</span>
                  {config.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
              {trip.destination}
            </h3>
            <p className="text-gray-600 text-sm">
              {trip.date} ({trip.duration})
            </p>
          </div>

          {/* Hotel Info - Conditional */}
          {trip.hotelName && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 truncate flex-1 mr-2">
                  {trip.hotelName}
                </h4>
                {trip.hotelStars && trip.hotelStars > 0 && (
                  <div className="flex items-center gap-1">
                    {renderStars(trip.hotelStars)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {trip.rating && trip.rating > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {trip.rating} ★
                  </span>
                )}
                {trip.category && (
                  <span className="text-gray-600 text-sm">{trip.category}</span>
                )}
              </div>
            </div>
          )}

          {/* Category without hotel */}
          {!trip.hotelName && trip.category && (
            <div className="mb-4">
              <span className="text-gray-600 text-sm">{trip.category}</span>
            </div>
          )}

          {/* Price & Button */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trip.currentPrice} €
                <span className="text-sm text-gray-600 font-normal">/asm.</span>
              </div>
              {trip.originalPrice && (
                <div className="text-gray-500 text-sm line-through">
                  {trip.originalPrice} €/asm.
                </div>
              )}
            </div>
            {!isAdmin && (
              <button
                onClick={openModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Žiūrėti
              </button>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit?.(trip.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
              >
                Redaguoti
              </button>
              <button
                onClick={() => onDelete?.(trip.id)}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Trinami..." : "Ištrinti"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative h-64">
              <Image
                src={trip.image}
                alt={trip.destination}
                fill
                className="object-cover rounded-t-xl"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {trip.badges?.map((badge, index) => {
                  const badgeConfig = {
                    "egzotine-kelione": {
                      bg: "bg-emerald-500",
                      icon: "✨",
                      text: "Egzotinė kelionė",
                    },
                    "dienos-kaina": {
                      bg: "bg-red-500",
                      icon: "%",
                      text: "Dienos kaina",
                    },
                    "paskutine-minute": {
                      bg: "bg-orange-500",
                      icon: "⚡",
                      text: "Paskutinė minutė",
                    },
                    Populiarus: {
                      bg: "bg-purple-500",
                      icon: "🔥",
                      text: "Populiarus",
                    },
                    "viskas-iskaiciuota": {
                      bg: "bg-blue-500",
                      icon: "🍽️",
                      text: "Viskas įskaičiuota",
                    },
                  };

                  const config = badgeConfig[badge];
                  return (
                    <div
                      key={index}
                      className={`${config.bg} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}
                    >
                      <span>{config.icon}</span>
                      {config.text}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {trip.destination}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    <span className="font-semibold">Išvykimo data:</span>{" "}
                    {trip.date}
                  </p>
                  <p className="text-gray-600 mb-6">
                    <span className="font-semibold">Trukmė:</span>{" "}
                    {trip.duration}
                  </p>

                  {/* Hotel Info */}
                  {trip.hotelName && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="text-xl font-semibold mb-3">Viešbutis</h3>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-800">
                          {trip.hotelName}
                        </h4>
                        {trip.hotelStars && trip.hotelStars > 0 && (
                          <div className="flex items-center gap-1">
                            {renderStars(trip.hotelStars)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {trip.rating && trip.rating > 0 && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {trip.rating} ★ Įvertinimas
                          </span>
                        )}
                        {trip.category && (
                          <span className="text-gray-600">{trip.category}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {trip.description && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">Aprašymas</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {trip.description}
                      </p>
                    </div>
                  )}

                  {/* Additional Features */}
                  {trip.additionalFeatures &&
                    trip.additionalFeatures.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">
                          Papildomi patogumai
                        </h3>
                        <ul className="space-y-2">
                          {trip.additionalFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-blue-500">★</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Right Column */}
                <div>
                  {/* Price */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Kaina</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {trip.currentPrice} €
                      <span className="text-lg text-gray-600 font-normal">
                        /asm.
                      </span>
                    </div>
                    {trip.originalPrice && (
                      <div className="text-gray-500 text-lg line-through mb-4">
                        Buvo: {trip.originalPrice} €/asm.
                      </div>
                    )}

                    {/* Kontaktai */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        💬 Susisiekite dėl rezervacijos
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 text-lg">📞</span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {trip.phoneNumber || "+370 600 12345"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Darbo dienomis 9:00-18:00
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 text-lg">📧</span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {trip.email || "info@krauklagamina.lt"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Atsakysime per 24h
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          {trip.facebook && (
                            <a
                              href={trip.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <FaFacebook className="text-lg" />
                              Facebook
                            </a>
                          )}
                          {trip.instagram && (
                            <a
                              href={trip.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <FaInstagram className="text-lg" />
                              Instagram
                            </a>
                          )}
                          {!trip.facebook && !trip.instagram && (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Sekite mus socialiniuose tinkluose
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Papildoma informacija
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {trip.flightInfo && (
                        <p>
                          <span className="font-medium">Skrydis:</span>{" "}
                          {trip.flightInfo}
                        </p>
                      )}
                      {trip.baggage && (
                        <p>
                          <span className="font-medium">Bagažas:</span>{" "}
                          {trip.baggage}
                        </p>
                      )}
                      {trip.busTravel && (
                        <p>
                          <span className="font-medium">Kelionė autobusu:</span>{" "}
                          {trip.busTravel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
