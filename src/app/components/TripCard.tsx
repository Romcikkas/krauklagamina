"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaImages,
  FaInfoCircle,
  FaRoute,
  FaClipboardList,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaPlane,
  FaBus,
  FaMapMarkedAlt,
  FaPercentage,
  FaRegThumbsUp,
  FaThumbsUp,
  FaChild,
  FaGlobeEurope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Trip, ContactSettings } from "../../data/types";
import { useTranslations, useLanguage } from "../../contexts/LanguageContext";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { travelerMemoLt } from "../../data/travelerMemo";

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
  const t = useTranslations("trips");
  const tMonths = useTranslations("months");
  const { locale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: contactSettings } = useSWR<ContactSettings>(
    "/api/contact-settings",
    fetcher,
  );

  const shouldLoadPartnerDetails =
    isModalOpen && (trip.source === "bus" || trip.source === "fly");

  const {
    data: partnerDetailsResponse,
    isLoading: isPartnerDetailsLoading,
    error: partnerDetailsError,
  } = useSWR(
    shouldLoadPartnerDetails
      ? `/api/partners/kelioniulaikas/details?id=${trip.id}`
      : null,
    fetcher,
  );

  const partnerDetailsData =
    partnerDetailsResponse &&
    typeof partnerDetailsResponse === "object" &&
    (partnerDetailsResponse as { status?: string }).status === "success"
      ? (partnerDetailsResponse as { data?: any }).data
      : null;

  const partnerImages = useMemo(() => {
    const images: { url: string; caption?: string }[] = [];
    const primaryUrl = partnerDetailsData?.image?.image_url;
    if (typeof primaryUrl === "string" && primaryUrl.trim().length > 0) {
      images.push({
        url: primaryUrl,
        caption:
          typeof partnerDetailsData?.image?.caption === "string"
            ? partnerDetailsData.image.caption
            : undefined,
      });
    }

    const gallery = partnerDetailsData?.gallery;
    if (Array.isArray(gallery)) {
      for (const item of gallery) {
        const url = item?.image_url;
        if (typeof url === "string" && url.trim().length > 0) {
          images.push({
            url,
            caption: typeof item?.caption === "string" ? item.caption : undefined,
          });
        }
      }
    }

    // Deduplicate
    return images.filter(
      (img, idx, arr) => arr.findIndex((x) => x.url === img.url) === idx,
    );
  }, [partnerDetailsData]);
 
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  type PartnerTab = "kelione" | "programa" | "galerija" | "atmintine";
  const [activePartnerTab, setActivePartnerTab] = useState<PartnerTab>("kelione");
  const [showAllDates, setShowAllDates] = useState(false);

  const shouldLoadProgramImages =
    shouldLoadPartnerDetails &&
    activePartnerTab === "programa" &&
    !!trip.externalUrl;

  const { data: programImagesResponse } = useSWR(
    shouldLoadProgramImages && trip.externalUrl
      ? `/api/partners/kelioniulaikas/program-images?url=${encodeURIComponent(
          trip.externalUrl,
        )}`
      : null,
    fetcher,
  );

  const programDayImages =
    programImagesResponse &&
    typeof programImagesResponse === "object" &&
    (programImagesResponse as { status?: string }).status === "success"
      ? ((programImagesResponse as any)?.data as
          | Array<{
              day: number;
              name: string | null;
              images: Array<{ full: string; thumb: string; alt: string | null }>;
            }>
          | null)
      : null;

  const programImagesFlat = useMemo(() => {
    if (!programDayImages) return [];
    const all: { url: string; caption?: string }[] = [];
    for (const d of programDayImages) {
      for (const img of d.images || []) {
        if (img?.full) {
          all.push({ url: img.full, caption: img.alt || undefined });
        }
      }
    }
    return all.filter(
      (img, idx, arr) => arr.findIndex((x) => x.url === img.url) === idx,
    );
  }, [programDayImages]);

  const galleryImages = useMemo(() => {
    const merged = [...partnerImages, ...programImagesFlat];
    return merged.filter(
      (img, idx, arr) => arr.findIndex((x) => x.url === img.url) === idx,
    );
  }, [partnerImages, programImagesFlat]);

  const galleryIndexByUrl = useMemo(() => {
    const map = new Map<string, number>();
    galleryImages.forEach((img, idx) => map.set(img.url, idx));
    return map;
  }, [galleryImages]);

  const memoSections = travelerMemoLt;

  const shouldLoadPartnerSnippet = shouldLoadPartnerDetails && !!trip.externalUrl;
  const { data: partnerSnippetResponse } = useSWR(
    shouldLoadPartnerSnippet && trip.externalUrl
      ? `/api/partners/kelioniulaikas/snippet?url=${encodeURIComponent(trip.externalUrl)}`
      : null,
    fetcher,
  );

  const partnerSnippet =
    partnerSnippetResponse &&
    typeof partnerSnippetResponse === "object" &&
    (partnerSnippetResponse as { status?: string }).status === "success"
      ? ((partnerSnippetResponse as any)?.data as
          | {
              slogan?: string | null;
              note?: string | null;
              countries?: string[];
              cities?: string[];
              amenities?: string[];
              mapEmbedUrl?: string | null;
            }
          | null)
      : null;

  const partnerAmenities = useMemo(() => {
    const items: { label: string; Icon?: React.ComponentType<any> }[] = [];

    // Transport
    const transport = String(trip.transportType || "").toLowerCase();
    if (trip.source === "fly" || transport.includes("lėkt") || transport.includes("lekt")) {
      items.push({ label: "Kelionės lėktuvu", Icon: FaPlane });
    } else if (trip.source === "bus" || transport.includes("autob")) {
      items.push({ label: "Kelionės autobusu", Icon: FaBus });
    }

    // Travel type
    const travelType = trip.travelType || trip.category;
    if (travelType) {
      items.push({ label: String(travelType), Icon: FaMapMarkedAlt });
    }

    // Badges → amenities-like labels (keep it subtle, no partner naming)
    const badgeToAmenity: Record<string, { label: string; Icon?: React.ComponentType<any> }> =
      {
        "dienos-kaina": { label: "Geriausi pasiūlymai", Icon: FaPercentage },
        Populiarus: { label: "Populiarios kelionės", Icon: FaRegThumbsUp },
        "paskutine-minute": { label: "Rekomenduojame", Icon: FaThumbsUp },
      };
    for (const b of trip.badges || []) {
      const mapped = badgeToAmenity[b];
      if (mapped) items.push(mapped);
    }

    // Heuristic: family-friendly if travel type mentions family/children
    const travelTypeNorm = String(trip.travelType || "").toLowerCase();
    if (travelTypeNorm.includes("šeim") || travelTypeNorm.includes("seim")) {
      items.push({ label: "Kelionės šeimai", Icon: FaChild });
    }

    // Prefer scraped amenities when available (closest to their UI)
    const scraped =
      partnerSnippet?.amenities && partnerSnippet.amenities.length > 0
        ? partnerSnippet.amenities
        : null;

    const amenityIcon = (label: string) => {
      const l = label.toLowerCase();
      if (l.includes("lėkt") || l.includes("lekt")) return FaPlane;
      if (l.includes("autobus")) return FaBus;
      if (l.includes("pažint")) return FaMapMarkedAlt;
      if (l.includes("pasiūlym") || l.includes("nuolaid")) return FaPercentage;
      if (l.includes("populiar")) return FaRegThumbsUp;
      if (l.includes("rekom")) return FaThumbsUp;
      if (l.includes("šeim") || l.includes("seim") || l.includes("vaik")) return FaChild;
      return undefined;
    };

    const fromScraped = scraped
      ? scraped.map((label) => ({ label, Icon: amenityIcon(label) }))
      : null;

    const combined = fromScraped ?? items;

    // Deduplicate by label
    return combined.filter(
      (it, idx, arr) => arr.findIndex((x) => x.label === it.label) === idx,
    );
  }, [
    partnerSnippet?.amenities,
    trip.badges,
    trip.category,
    trip.source,
    trip.transportType,
    trip.travelType,
  ]);

  const openGallery = (startIndex: number) => {
    setGalleryIndex(startIndex);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const showPrevImage = () => {
    setGalleryIndex((prev) =>
      prev === 0 ? Math.max(galleryImages.length - 1, 0) : prev - 1,
    );
  };

  const showNextImage = () => {
    setGalleryIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  const getSanitizedHtml = (html?: string | null) => {
    if (!html || html.trim().length === 0) return null;
    let result = html;

    // Remove explicit references to the partner brand and domain
    result = result.replace(/Kelionių\s+laikas/gi, "");
    result = result.replace(/kelioniulaikas\.lt/gi, "");

    return result;
  };

  const getSanitizedPriceNotIncluded = (html?: string | null) => {
    if (!html || html.trim().length === 0) return null;

    // Remove list items mentioning insurance ("draudim") entirely
    let result = html.replace(
      /<li[^>]*>[^<]*draudim[\s\S]*?<\/li>/gi,
      "",
    );

    return getSanitizedHtml(result);
  };

  const parseAtmintineSections = (html: string) => {
    const sanitized = getSanitizedHtml(html) || "";
    if (sanitized.trim().length === 0) return [];

    const headingRe =
      /<p[^>]*>\s*(?:<strong>)?\s*([A-ZĄČĘĖĮŠŲŪŽ0-9][A-ZĄČĘĖĮŠŲŪŽ0-9\s\-–„“"()\/]+)\s*:\s*(?:<\/strong>)?\s*<\/p>/gi;

    const matches = Array.from(sanitized.matchAll(headingRe));
    if (matches.length === 0) {
      return [{ title: "Atmintinė", html: sanitized }];
    }

    const sections: { title: string; html: string }[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const title = String(match[1] || "").trim();
      const start = (match.index ?? 0) + match[0].length;
      const end =
        i + 1 < matches.length ? (matches[i + 1].index ?? sanitized.length) : sanitized.length;
      const body = sanitized.slice(start, end).trim();

      // Drop insurance section completely
      if (/DRAUDIM/gi.test(title)) {
        continue;
      }

      // Drop empty sections
      if (body.replace(/<[^>]+>/g, "").trim().length === 0) {
        continue;
      }

      sections.push({ title, html: body });
    }

    // If the first heading is a generic wrapper, keep it but render it as the first section
    return sections;
  };

  // Get destination based on current locale with fallback to LT
  const getDestination = () => {
    if (locale === "en" && trip.destinationEn) return trip.destinationEn;
    if (locale === "pl" && trip.destinationPl) return trip.destinationPl;
    return trip.destinationLt || trip.destination;
  };

  // Get description based on current locale with fallback to LT
  const getDescription = () => {
    if (locale === "en" && trip.descriptionEn) return trip.descriptionEn;
    if (locale === "pl" && trip.descriptionPl) return trip.descriptionPl;
    return trip.descriptionLt || trip.description;
  };

  // Get flight info based on current locale with fallback to LT
  const getFlightInfo = () => {
    if (locale === "en" && trip.flightInfoEn) return trip.flightInfoEn;
    if (locale === "pl" && trip.flightInfoPl) return trip.flightInfoPl;
    return trip.flightInfoLt || trip.flightInfo;
  };

  const getBaggage = () => {
    if (locale === "en" && trip.baggageEn) return trip.baggageEn;
    if (locale === "pl" && trip.baggagePl) return trip.baggagePl;
    return trip.baggageLt || trip.baggage;
  };

  const getBusTravel = () => {
    if (locale === "en" && trip.busTravelEn) return trip.busTravelEn;
    if (locale === "pl" && trip.busTravelPl) return trip.busTravelPl;
    return trip.busTravelLt || trip.busTravel;
  };

  const getAdditionalFeatures = () => {
    if (
      locale === "en" &&
      trip.additionalFeaturesEn &&
      trip.additionalFeaturesEn.length > 0
    )
      return trip.additionalFeaturesEn;
    if (
      locale === "pl" &&
      trip.additionalFeaturesPl &&
      trip.additionalFeaturesPl.length > 0
    )
      return trip.additionalFeaturesPl;
    return trip.additionalFeaturesLt || trip.additionalFeatures || [];
  };

  const renderStars = (count: number | string) => {
    const numCount = typeof count === "string" ? parseInt(count, 10) : count;
    if (isNaN(numCount) || numCount <= 0) return null;
    return Array.from({ length: numCount }, (_, i) => (
      <span key={i} className="text-yellow-400 text-sm">
        ★
      </span>
    ));
  };

  // Function to translate month names and reorder date format for Polish
  const translateDate = (dateString?: string | null) => {
    if (!dateString || dateString.trim().length === 0) {
      return null;
    }

    const lithuanianMonths = [
      "sausio",
      "vasario",
      "kovo",
      "balandžio",
      "gegužės",
      "birželio",
      "liepos",
      "rugpjūčio",
      "rugsėjo",
      "spalio",
      "lapkričio",
      "gruodžio",
    ];

    let result = dateString;

    // First, translate month names (case-insensitive)
    lithuanianMonths.forEach((month) => {
      const regex = new RegExp(`\\b${month}\\b`, "gi");
      result = result.replace(regex, tMonths(month));
    });

    // Then, for Polish locale, reorder the date format
    if (locale === "pl") {
      // Pattern 1: "YYYY Month D - D d." → "YYYY, D-D Month"
      // Example: "2025 lipca 1 - 3 d." → "2025, 1-3 lipca"
      const pattern1 =
        /(\d{4})\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s+(\d+)\s+-\s+(\d+)\s+d\./gi;
      const match1 = result.match(pattern1);

      if (match1) {
        result = result.replace(pattern1, "$1, $3-$4 $2");
      } else {
        // Pattern 2: "YYYY Month DD-DD" → "YYYY, DD-DD Month"
        // Example: "2025 września 17-24" → "2025, 17-24 września"
        const pattern2 = /(\d{4})\s+([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)\s+([\d-]+)/g;
        result = result.replace(pattern2, "$1, $3 $2");
      }
    }

    return result;
  };

  const translatedDate = translateDate(trip.date);
  const phoneNumber = contactSettings?.defaultPhone || "";
  const phoneHref = phoneNumber
    ? `tel:${phoneNumber.replace(/[^+0-9]/g, "")}`
    : "";
  const description = getDescription();
  const additionalFeatures = getAdditionalFeatures();
  const flightInfo = getFlightInfo();
  const baggageInfo = getBaggage();
  const busTravelInfo = getBusTravel();
  const emailAddress =
    (trip.email && trip.email.trim()) || contactSettings?.defaultEmail || "";
  const facebookUrl =
    (trip.facebook && trip.facebook.trim()) ||
    contactSettings?.defaultFacebook ||
    "";
  const instagramUrl =
    (trip.instagram && trip.instagram.trim()) ||
    contactSettings?.defaultInstagram ||
    "";
  const formattedCountries =
    trip.countries && trip.countries.length > 0
      ? trip.countries.join(", ")
      : null;
  const scheduleText = (() => {
    if (translatedDate && trip.duration) {
      return `${translatedDate} (${trip.duration})`;
    }
    if (translatedDate) {
      return translatedDate;
    }
    if (trip.duration) {
      return trip.duration;
    }
    return null;
  })();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <Image
            src={trip.image}
            alt={getDestination()}
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
                  text: t("badges.exotic"),
                },
                "dienos-kaina": {
                  bg: "bg-red-500",
                  icon: "%",
                  text: t("badges.dailyPrice"),
                },
                "paskutine-minute": {
                  bg: "bg-orange-500",
                  icon: "⚡",
                  text: t("badges.lastMinute"),
                },
                Populiarus: {
                  bg: "bg-purple-500",
                  icon: "🔥",
                  text: t("badges.popular"),
                },
                "viskas-iskaiciuota": {
                  bg: "bg-blue-500",
                  icon: "🍽️",
                  text: t("badges.allInclusive"),
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
              {getDestination()}
            </h3>
            {scheduleText && (
              <p className="text-gray-600 text-sm">{scheduleText}</p>
            )}
          </div>

          {(trip.transportType || trip.travelType) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {trip.transportType &&
                (() => {
                  const t = (trip.transportType || "").toLowerCase();
                  const isFly =
                    trip.source === "fly" ||
                    t.includes("lėkt") ||
                    t.includes("lekt");
                  const Icon = isFly ? FaPlane : FaBus;
                  const classes =
                    "inline-flex items-center gap-1 rounded-full bg-transparent border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700";
                  const iconClass = isFly ? "text-emerald-600" : "text-blue-600";
                  return (
                    <span className={classes}>
                      <Icon className={iconClass} />
                      <span>{trip.transportType}</span>
                    </span>
                  );
                })()}
              {trip.travelType && trip.travelType !== trip.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  🧭 {trip.travelType}
                </span>
              )}
            </div>
          )}

          {formattedCountries && (
            <p className="mb-4 text-sm text-gray-700 flex items-center gap-2 font-semibold">
              <FaGlobeEurope className="text-blue-500" />
              <span>{formattedCountries}</span>
            </p>
          )}

          {/* Hotel Info - Conditional */}
          {trip.hotelName && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 truncate flex-1 mr-2">
                  {trip.hotelName}
                </h4>
                {trip.hotelStars && Number(trip.hotelStars) > 0 && (
                  <div className="flex items-center gap-1">
                    {renderStars(trip.hotelStars)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {(trip.rating ?? 0) > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {trip.rating} ★
                  </span>
                )}
                {trip.category && (
                  <span className="text-gray-600 text-sm">
                    {t(`categories.${trip.category}`) !==
                    `categories.${trip.category}`
                      ? t(`categories.${trip.category}`)
                      : trip.category}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category without hotel */}
          {!trip.hotelName && trip.category && (
            <div className="mb-4">
              <span className="text-gray-600 text-sm">
                {t(`categories.${trip.category}`) !==
                `categories.${trip.category}`
                  ? t(`categories.${trip.category}`)
                  : trip.category}
              </span>
            </div>
          )}

          {/* Price & Button */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trip.currentPrice} €
                <span className="text-sm text-gray-600 font-normal">
                  {t("perPerson")}
                </span>
              </div>
              {trip.originalPrice && (
                <div className="text-gray-500 text-sm line-through">
                  {trip.originalPrice} €{t("perPerson")}
                </div>
              )}
            </div>
            {!isAdmin && (
              <button
                onClick={openModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {t("viewDetails")}
              </button>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={openModal}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex-1"
              >
                {t("view")}
              </button>
              <button
                onClick={() => onEdit?.(trip.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex-1"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => onDelete?.(trip.id)}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex-1"
              >
                {deleteLoading ? t("deleting") : t("delete")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <div className="relative h-64">
                <Image
                  src={
                    partnerImages.length > 0
                      ? partnerImages[0].url
                      : trip.image
                  }
                  alt={getDestination()}
                  fill
                  className="object-cover rounded-t-xl"
                />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                {trip.badges?.map((badge, index) => {
                  const badgeConfig = {
                    "egzotine-kelione": {
                      bg: "bg-emerald-500",
                      icon: "✨",
                      text: t("badges.exotic"),
                    },
                    "dienos-kaina": {
                      bg: "bg-red-500",
                      icon: "%",
                      text: t("badges.dailyPrice"),
                    },
                    "paskutine-minute": {
                      bg: "bg-orange-500",
                      icon: "⚡",
                      text: t("badges.lastMinute"),
                    },
                    Populiarus: {
                      bg: "bg-purple-500",
                      icon: "🔥",
                      text: t("badges.popular"),
                    },
                    "viskas-iskaiciuota": {
                      bg: "bg-blue-500",
                      icon: "🍽️",
                      text: t("badges.allInclusive"),
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
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {getDestination()}
                  </h2>
                  {translatedDate && (
                    <p className="text-gray-600 mb-4">
                      <span className="font-semibold">
                        {t("modal.departureDate")}
                      </span>{" "}
                      {translatedDate}
                    </p>
                  )}
                  {trip.duration && (
                    <p className="text-gray-600 mb-6">
                      <span className="font-semibold">
                        {t("modal.duration")}
                      </span>{" "}
                      {trip.duration}
                    </p>
                  )}

                  {/* Partner tabs (Kelionių laikas) */}
                  {shouldLoadPartnerDetails && (
                    <div className="mb-6 border-b border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "kelione" as PartnerTab, label: "Kelionė" },
                          { key: "programa" as PartnerTab, label: "Programa" },
                          {
                            key: "galerija" as PartnerTab,
                            label: "Galerija",
                            disabled: partnerImages.length === 0,
                          },
                          // Atmintinė is only applicable for bus partner trips
                          ...(trip.source === "bus"
                            ? ([
                                {
                                  key: "atmintine" as PartnerTab,
                                  label: "Atmintinė",
                                  disabled: false,
                                },
                              ] as const)
                            : []),
                        ].map(({ key, label, disabled }) => (
                          <button
                            key={key}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && setActivePartnerTab(key)}
                            className={`relative px-3 py-2 text-xs sm:text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors ${
                              disabled
                                ? "cursor-not-allowed text-gray-400 border-transparent"
                                : activePartnerTab === key
                                  ? "text-blue-600 border-blue-600"
                                  : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hotel Info */}
                  {trip.hotelName && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="text-xl font-semibold mb-3">
                        {t("modal.hotel")}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-800">
                          {trip.hotelName}
                        </h4>
                        {trip.hotelStars && Number(trip.hotelStars) > 0 && (
                          <div className="flex items-center gap-1">
                            {renderStars(trip.hotelStars)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {(trip.rating ?? 0) > 0 && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {trip.rating} ★ {t("modal.rating")}
                          </span>
                        )}
                        {trip.category && (
                          <span className="text-gray-600">
                            {t(`categories.${trip.category}`) !==
                            `categories.${trip.category}`
                              ? t(`categories.${trip.category}`)
                              : trip.category}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description (local trips) */}
                  {description && !shouldLoadPartnerDetails && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">
                        {t("modal.description")}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Partner details (Kelionių laikas) */}
                  {shouldLoadPartnerDetails && (
                    <div className="mb-6">
                      {isPartnerDetailsLoading ? (
                        <p className="text-gray-600">{t("loading")}</p>
                      ) : partnerDetailsError ? (
                        <p className="text-red-600">
                          {partnerDetailsError instanceof Error
                            ? partnerDetailsError.message
                            : "Nepavyko gauti detalių"}
                        </p>
                      ) : partnerDetailsData ? (
                        <>
                          {activePartnerTab === "kelione" && (
                            <div className="space-y-6">
                              {(partnerSnippet?.slogan ||
                                partnerSnippet?.note ||
                                (partnerSnippet?.countries &&
                                  partnerSnippet.countries.length > 0) ||
                                (partnerSnippet?.cities &&
                                  partnerSnippet.cities.length > 0)) && (
                                <div className="rounded-xl border border-gray-200 bg-white p-5">
                                  <div>
                                    {partnerSnippet?.slogan && (
                                      <p className="text-sm font-semibold text-emerald-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {partnerSnippet.slogan}
                                      </p>
                                    )}
                                    {partnerSnippet?.note && (
                                      <p className="mt-1 text-sm font-semibold text-rose-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {partnerSnippet.note}
                                      </p>
                                    )}

                                      {partnerSnippet?.countries &&
                                        partnerSnippet.countries.length > 0 && (
                                          <div className="mt-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900">
                                                <FaGlobeEurope className="text-blue-500" />
                                                <span>
                                                  {partnerSnippet.countries.join(", ")}
                                                </span>
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                      {partnerSnippet?.cities &&
                                        partnerSnippet.cities.length > 0 && (
                                          <div className="mt-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <FaMapMarkerAlt className="text-gray-500" />
                                                <span>Miestai</span>
                                              </span>
                                              <ul className="flex flex-wrap gap-2">
                                              {partnerSnippet.cities.map((c) => (
                                                <li
                                                  key={c}
                                                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900"
                                                >
                                                  {c}
                                                </li>
                                              ))}
                                            </ul>
                                            </div>
                                          </div>
                                        )}
                                  </div>

                                  {partnerAmenities.length > 0 && (
                                    <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                      {partnerAmenities.map((a) => (
                                        <li
                                          key={a.label}
                                          className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 border border-gray-100"
                                        >
                                          {a.Icon ? (
                                            <a.Icon className="text-blue-600" />
                                          ) : (
                                            <span className="text-blue-600">•</span>
                                          )}
                                          <span>{a.label}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {partnerDetailsData.intro && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <FaInfoCircle className="text-blue-600" />
                                    <span>Kelionės aprašymas</span>
                                  </h3>
                                  <div
                                    className="prose prose-sm max-w-none text-gray-700"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        getSanitizedHtml(
                                          String(partnerDetailsData.intro),
                                        ) || "",
                                    }}
                                  />
                                </div>
                              )}

                              {partnerSnippet?.mapEmbedUrl && (
                                <div className="mt-6">
                                  <h3 className="text-xl font-semibold mb-3">
                                    Kelionės maršrutas
                                  </h3>
                                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <div className="relative w-full aspect-[4/3]">
                                      <iframe
                                        src={partnerSnippet.mapEmbedUrl}
                                        className="absolute inset-0 h-full w-full"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {Array.isArray(partnerDetailsData.dates) &&
                                partnerDetailsData.dates.length > 0 && (
                                  <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                      <FaClipboardList className="text-blue-600" />
                                      <span>Kelionės datos</span>
                                    </h3>
                                    <div className="space-y-3">
                                      {partnerDetailsData.dates
                                        .slice(
                                          0,
                                          showAllDates
                                            ? partnerDetailsData.dates.length
                                            : 5,
                                        )
                                        .map((d: any, idx: number) => {
                                          const from = d?.date_from || d?.fdate_rom;
                                          const to = d?.date_to;
                                          const range =
                                            from && to ? `${from} – ${to}` : from || "";
                                          const freePlaces =
                                            typeof d?.free_places === "number"
                                              ? d.free_places
                                              : null;
                                          const priceNumber =
                                            typeof d?.price === "string"
                                              ? Number(d.price)
                                              : typeof d?.price === "number"
                                                ? d.price
                                                : null;
                                          return (
                                            <div
                                              key={`${d?.id ?? idx}-${idx}`}
                                              className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                              <div>
                                                <p className="font-semibold text-gray-900">
                                                  {range}
                                                </p>
                                                {freePlaces !== null && (
                                                  <p className="mt-1 text-xs text-emerald-700">
                                                    liko {freePlaces} viet.
                                                  </p>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                {priceNumber !== null &&
                                                  !Number.isNaN(priceNumber) && (
                                                    <div className="text-lg font-bold text-gray-900">
                                                      {priceNumber} €
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                    {partnerDetailsData.dates.length > 5 && (
                                      <div className="mt-3">
                                        <button
                                          type="button"
                                          onClick={() => setShowAllDates((v) => !v)}
                                          className="inline-flex items-center justify-center px-1 py-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                          {showAllDates
                                            ? "Rodyti mažiau datų"
                                            : "Visos kelionės datos"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {(partnerDetailsData.price_included ||
                                partnerDetailsData.price_not_included) && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <FaClipboardList className="text-blue-600" />
                                    <span>Kainos informacija</span>
                                  </h3>
                                  <div className="space-y-6">
                                    {partnerDetailsData.price_included && (
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <h4 className="text-lg font-semibold mb-2">
                                          Įskaičiuota
                                        </h4>
                                        <div
                                          className="prose prose-sm max-w-none text-gray-700"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              getSanitizedHtml(
                                                String(
                                                  partnerDetailsData.price_included,
                                                ),
                                              ) || "",
                                          }}
                                        />
                                      </div>
                                    )}
                                    {partnerDetailsData.price_not_included && (
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <h4 className="text-lg font-semibold mb-2">
                                          Neįskaičiuota
                                        </h4>
                                        <div
                                          className="prose prose-sm max-w-none text-gray-700"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              getSanitizedPriceNotIncluded(
                                                String(
                                                  partnerDetailsData.price_not_included,
                                                ),
                                              ) || "",
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {partnerDetailsData.notes && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <FaExclamationCircle className="text-amber-500" />
                                    <span>Pastabos</span>
                                  </h3>
                                  <div
                                    className="prose prose-sm max-w-none text-gray-700 rounded-lg border border-gray-200 bg-white p-4"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        getSanitizedHtml(
                                          String(partnerDetailsData.notes),
                                        ) || "",
                                    }}
                                  />
                                </div>
                              )}

                            </div>
                          )}

                          {activePartnerTab === "programa" &&
                            Array.isArray(partnerDetailsData.program) &&
                            partnerDetailsData.program.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                  <FaRoute className="text-blue-600" />
                                  <span>Kelionės programa</span>
                                </h3>
                                {partnerDetailsData.program.map(
                                  (day: any, index: number) => (
                                    <div
                                      key={`${day?.day ?? index}-${index}`}
                                      className="rounded-lg border border-gray-200 bg-white p-4"
                                    >
                                      <div className="mb-2 flex items-baseline gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                          {typeof day?.day === "number"
                                            ? `Diena ${day.day}`
                                            : "Diena"}
                                        </span>
                                        {day?.name && (
                                          <span className="font-semibold text-gray-900">
                                            {String(day.name)}
                                          </span>
                                        )}
                                      </div>
                                      {day?.text && (
                                        <div
                                          className="prose prose-sm max-w-none text-gray-700"
                                          dangerouslySetInnerHTML={{
                                            __html: String(day.text),
                                          }}
                                        />
                                      )}

                                      {typeof day?.day === "number" &&
                                        Array.isArray(programDayImages) && (
                                          (() => {
                                            const matched = programDayImages.find(
                                              (d) => d.day === day.day,
                                            );
                                            if (!matched || matched.images.length === 0) {
                                              return null;
                                            }
                                            return (
                                              <div className="mt-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                  {matched.images
                                                    .slice(0, 6)
                                                    .map((img, imgIdx) => {
                                                      const idxInGallery =
                                                        galleryIndexByUrl.get(
                                                          img.full,
                                                        ) ?? 0;
                                                      return (
                                                        <button
                                                          key={`${img.full}-${imgIdx}`}
                                                          type="button"
                                                          onClick={() =>
                                                            openGallery(idxInGallery)
                                                          }
                                                          className="relative h-24 w-full overflow-hidden rounded-md border border-gray-200 hover:border-blue-500 transition-colors"
                                                          title={img.alt || ""}
                                                        >
                                                          <Image
                                                            src={img.thumb}
                                                            alt={img.alt || getDestination()}
                                                            fill
                                                            className="object-cover"
                                                          />
                                                        </button>
                                                      );
                                                    })}
                                                </div>
                                              </div>
                                            );
                                          })()
                                        )}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}

                          {activePartnerTab === "galerija" &&
                            galleryImages.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <FaImages className="text-blue-600" />
                                    <span>Galerija</span>
                                  </h3>
                                  {galleryImages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => openGallery(0)}
                                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                    >
                                      Peržiūrėti visas
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {galleryImages.slice(0, 6).map(
                                    (img, index) => (
                                      <button
                                        key={img.url}
                                        type="button"
                                        onClick={() => openGallery(index)}
                                        className="relative h-24 w-full overflow-hidden rounded-md border border-gray-200 hover:border-blue-500 transition-colors"
                                        title={img.caption || ""}
                                      >
                                        <Image
                                          src={img.url}
                                          alt={
                                            img.caption || getDestination()
                                          }
                                          fill
                                          className="object-cover"
                                        />
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {activePartnerTab === "atmintine" &&
                            trip.source === "bus" && (
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                              <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaExclamationCircle className="text-amber-500" />
                                    <span>Atmintinė keliautojui</span>
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {getDestination()}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-6">
                                {memoSections
                                  .filter(
                                    (section) =>
                                      Array.isArray(section.paragraphs) &&
                                      section.paragraphs.length > 0,
                                  )
                                  .map((section, idx) => (
                                  <section
                                    key={`${section.title}-${idx}`}
                                    className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0"
                                  >
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {section.title}:
                                    </h4>
                                    <div className="mt-3 space-y-3">
                                      {section.paragraphs.map((p, pIdx) => (
                                        <p
                                          key={`${section.title}-${pIdx}`}
                                          className="text-sm text-gray-700 leading-relaxed"
                                        >
                                          {p}
                                        </p>
                                      ))}
                                    </div>
                                  </section>
                                ))}
                              </div>
                            </div>
                            )}
                        </>
                      ) : (
                        <p className="text-gray-600">
                          Detalus aprašymas nerastas.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Additional Features */}
                  {additionalFeatures.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">
                        {t("modal.additionalFeatures")}
                      </h3>
                      <ul className="space-y-2">
                        {additionalFeatures.map((feature, index) => (
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
                    <h3 className="text-xl font-semibold mb-4">
                      {t("modal.price")}
                    </h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {trip.currentPrice} €
                      <span className="text-lg text-gray-600 font-normal">
                        {t("perPerson")}
                      </span>
                    </div>
                    {trip.originalPrice && (
                      <div className="text-gray-500 text-lg line-through mb-4">
                        {t("modal.was")} {trip.originalPrice} €{t("perPerson")}
                      </div>
                    )}

                    {/* Kontaktai */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        {t("modal.contactForReservation")}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 text-lg">📞</span>
                          <div>
                            {phoneNumber ? (
                              <a
                                href={phoneHref}
                                className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                              >
                                {phoneNumber}
                              </a>
                            ) : (
                              <p className="font-medium text-gray-800"></p>
                            )}
                            <p className="text-sm text-gray-600">
                              {t("modal.workingHours")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 text-lg">📧</span>
                          <div>
                            {emailAddress ? (
                              <a
                                href={`mailto:${emailAddress}`}
                                className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                              >
                                {emailAddress}
                              </a>
                            ) : (
                              <p className="font-medium text-gray-800"></p>
                            )}
                            <p className="text-sm text-gray-600">
                              {t("modal.responseTime")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          {facebookUrl || instagramUrl ? (
                            <>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {t("modal.followSocial")}
                              </p>
                              <div className="flex gap-3">
                                {facebookUrl && (
                                  <a
                                    href={facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <FaFacebook className="text-lg" />
                                    Facebook
                                  </a>
                                )}
                                {instagramUrl && (
                                  <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <FaInstagram className="text-lg" />
                                    Instagram
                                  </a>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-2">
                              {t("modal.followSocial")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      {t("modal.additionalInfo")}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {flightInfo && (
                        <p>
                          <span className="font-medium">
                            {t("modal.flight")}
                          </span>{" "}
                          {flightInfo}
                        </p>
                      )}
                      {baggageInfo && (
                        <p>
                          <span className="font-medium">
                            {t("modal.baggage")}
                          </span>{" "}
                          {baggageInfo}
                        </p>
                      )}
                      {trip.transportType && !busTravelInfo && (
                        <p>
                          <span className="font-medium">
                            {t("modal.busTravel")}
                          </span>{" "}
                          {trip.transportType}
                        </p>
                      )}
                      {busTravelInfo && (
                        <p>
                          <span className="font-medium">
                            {t("modal.busTravel")}
                          </span>{" "}
                          {busTravelInfo}
                        </p>
                      )}
                      {formattedCountries && (
                        <p>
                          <span className="font-medium">🗺️</span>{" "}
                          {formattedCountries}
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

      {/* Partner gallery lightbox */}
      {shouldLoadPartnerDetails && isGalleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={closeGallery}
            className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-gray-800 hover:bg-white"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={showPrevImage}
            className="absolute left-4 rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-6xl">
            <Image
              src={galleryImages[galleryIndex].url}
              alt={
                galleryImages[galleryIndex].caption || getDestination()
              }
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={showNextImage}
            className="absolute right-4 rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
