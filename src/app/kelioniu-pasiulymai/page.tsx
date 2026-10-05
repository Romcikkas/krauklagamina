"use client";

import TripCard from "../components/TripCard";
import ErrorMessage from "../components/ErrorMessage";
import { Trip, TripSettings } from "../../data/types";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { useTranslations, useLanguage } from "../../contexts/LanguageContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  clearGrudaWidget,
  declineGrudaConsent,
  getGrudaConsentChoice,
  loadGrudaIframeScript,
  resetGrudaConsentChoice,
  setGrudaConsent,
  type GrudaConsentChoice,
} from "../../lib/gruda-consent";

const GRUDA_PRIVACY_URL = "https://www.gruda.lt/privatumo-politika";

function GrudaWidgetPreview({ previewHint }: { previewHint: string }) {
  return (
    <div
      className="mb-10 rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden"
      aria-hidden
    >
      <p className="text-center text-xs text-gray-500 py-2 px-4 bg-gray-50/90 border-b border-gray-100">
        {previewHint}
      </p>
      <div className="p-5 sm:p-6 space-y-4 min-h-[200px] sm:min-h-[240px] opacity-80">
        <div className="h-9 max-w-md mx-auto rounded-md bg-gray-200/70" />
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-16 rounded-full bg-gray-200/60" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-100 bg-white/50 p-2 space-y-2"
            >
              <div className="h-20 rounded-md bg-gray-200/60" />
              <div className="h-3 w-4/5 rounded bg-gray-200/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KelioniuPasiulymai() {
  const t = useTranslations("trips");
  const { messages } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  type TransportFilter = "all" | "bus" | "fly";
  const [transportFilter, setTransportFilter] =
    useState<TransportFilter>("all");

  // Check if translations are loaded
  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      setIsLoaded(true);
    }
  }, [messages]);

  // Use SWR for trips data
  const {
    data: primaryTrips = [],
    isLoading: isPrimaryLoading,
    error: primaryError,
  } = useSWR<Trip[]>("/api/trips", fetcher);

  const { data: tripSettings, error: settingsError } = useSWR<TripSettings>(
    "/api/trip-settings",
    fetcher,
  );

  const showBusTrips = tripSettings?.showBusTrips === true;
  const showFlyTrips = tripSettings?.showFlyTrips === true;
  const showGrudaWidget = tripSettings?.showGrudaWidget === true;
  const tGruda = useTranslations("trips.grudaConsent");
  const [grudaChoice, setGrudaChoice] = useState<GrudaConsentChoice | null>(
    null,
  );
  const [grudaChoiceReady, setGrudaChoiceReady] = useState(false);

  useEffect(() => {
    if (!showGrudaWidget) {
      setGrudaChoice(null);
      setGrudaChoiceReady(false);
      return;
    }
    setGrudaChoice(getGrudaConsentChoice());
    setGrudaChoiceReady(true);
  }, [showGrudaWidget]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!showGrudaWidget) {
      clearGrudaWidget();
      return;
    }

    if (grudaChoice !== "accepted") {
      clearGrudaWidget();
      return;
    }

    loadGrudaIframeScript();
  }, [showGrudaWidget, grudaChoice]);

  const acceptGruda = useCallback(() => {
    setGrudaConsent();
    setGrudaChoice("accepted");
  }, []);

  const declineGruda = useCallback(() => {
    declineGrudaConsent();
    clearGrudaWidget();
    setGrudaChoice("declined");
  }, []);

  const reopenGrudaChoice = useCallback(() => {
    resetGrudaConsentChoice();
    clearGrudaWidget();
    setGrudaChoice(null);
  }, []);

  const showGrudaConsentModal =
    showGrudaWidget && grudaChoiceReady && grudaChoice === null;

  useEffect(() => {
    if (!showGrudaConsentModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showGrudaConsentModal]);

  const {
    data: busTrips = [],
    isLoading: isBusLoading,
    error: busError,
  } = useSWR<Trip[]>(showBusTrips ? "/api/trips/bus" : null, fetcher);

  const {
    data: flyTrips = [],
    isLoading: isFlyLoading,
    error: flyError,
  } = useSWR<Trip[]>(showFlyTrips ? "/api/trips/fly" : null, fetcher);

  const allTrips = useMemo(
    () =>
      [
        ...primaryTrips,
        ...(showBusTrips ? busTrips : []),
        ...(showFlyTrips ? flyTrips : []),
      ].filter(
        (trip) =>
          typeof trip.currentPrice === "number" && trip.currentPrice > 0,
      ),
    [primaryTrips, busTrips, flyTrips, showBusTrips, showFlyTrips],
  );

  const filteredTrips = useMemo(() => {
    if (transportFilter === "all") {
      return allTrips;
    }

    return allTrips.filter((trip) => {
      const normalizedTransport = (trip.transportType || "")
        .toLowerCase()
        .trim();
      const normalizedNoDiacritics = normalizedTransport
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (transportFilter === "bus") {
        return (
          trip.source === "bus" ||
          normalizedTransport.includes("autob") ||
          normalizedNoDiacritics.includes("autob")
        );
      }

      if (transportFilter === "fly") {
        return (
          trip.source === "fly" ||
          normalizedTransport.includes("lėkt") ||
          normalizedTransport.includes("lekt") ||
          normalizedNoDiacritics.includes("lekt")
        );
      }

      return true;
    });
  }, [allTrips, transportFilter]);

  const isLoading =
    isPrimaryLoading ||
    (showBusTrips ? isBusLoading : false) ||
    (showFlyTrips ? isFlyLoading : false);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = useMemo(
    () => filteredTrips.slice(startIndex, endIndex),
    [filteredTrips, startIndex, endIndex],
  );

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [transportFilter]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (primaryError) {
    return <ErrorMessage message={primaryError.message} />;
  }
  if (settingsError) {
    return <ErrorMessage message={settingsError.message} />;
  }
  if (showBusTrips && busError) {
    return <ErrorMessage message={busError.message} />;
  }
  if (showFlyTrips && flyError) {
    return <ErrorMessage message={flyError.message} />;
  }

  return (
    <div>
      {showGrudaConsentModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gruda-consent-dialog-title"
          onClick={acceptGruda}
        >
          <div
            className="flex min-h-full items-start justify-center pt-[12vh] sm:pt-[14vh] px-4 sm:px-6 pb-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-xl sm:max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl px-5 py-5 sm:px-7 sm:py-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={acceptGruda}
                aria-label={tGruda("closeAgreeLabel")}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-xl leading-none"
              >
                ×
              </button>
              <h2
                id="gruda-consent-dialog-title"
                className="text-base font-semibold text-gray-900 mb-2 pr-8"
              >
                {tGruda("modalTitle")}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {tGruda("notice")}
              </p>
              <p className="mb-5">
                <a
                  href={GRUDA_PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {tGruda("privacyLinkLabel")}
                </a>
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={declineGruda}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {tGruda("decline")}
                </button>
                <button
                  type="button"
                  onClick={acceptGruda}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  {tGruda("accept")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          showGrudaConsentModal ? "pointer-events-none opacity-[0.88]" : ""
        }
      >
      {/* Hero Section - Full Width */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isLoaded ? t("title") : ""}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isLoaded ? t("subtitle") : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-14 w-full">
        <div className="py-12">
          {showGrudaWidget && grudaChoiceReady && grudaChoice === "accepted" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-h-[2800px] lg:max-h-[3200px] xl:max-h-[2200px] overflow-y-hidden p-4 sm:p-6 mb-10">
              <div id="gruda_iframe" className=""></div>
            </div>
          )}

          {showGrudaWidget && grudaChoiceReady && grudaChoice !== "accepted" && (
            <>
              <GrudaWidgetPreview previewHint={tGruda("previewHint")} />
              {grudaChoice === "declined" && (
                <div className="mb-10 -mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {tGruda("declinedMessage")}
                  </p>
                  <button
                    type="button"
                    onClick={reopenGrudaChoice}
                    className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    {tGruda("changeChoice")}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Items per page selector */}
          {!isLoading && filteredTrips.length > 0 && (
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: t("transportFilters.all") },
                  { key: "bus", label: t("transportFilters.bus") },
                  { key: "fly", label: t("transportFilters.fly") },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTransportFilter(key as TransportFilter)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      transportFilter === key
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-200"
                    }`}
                    aria-pressed={transportFilter === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="bg-white px-2 py-1 sm:px-4 sm:py-2 rounded-md border border-gray-200">
                  <p className="text-xs sm:text-base text-gray-700">
                    {startIndex + 1}-{Math.min(endIndex, filteredTrips.length)}{" "}
                    <span className="text-gray-500">iš</span>{" "}
                    {filteredTrips.length}
                  </p>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-base bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{t("loading")}</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t("noTrips")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {currentTrips.map((trip) => (
                  <TripCard
                    key={`${trip.source || "local"}-${trip.id}`}
                    trip={trip}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>

                  {/* Page numbers */}
                  {generatePageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white border border-blue-600"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
