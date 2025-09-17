"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { ContactSettings } from "../../data/types";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("LT");
  const { isAdmin, logout } = useAuth();

  // Fetch contact settings for mobile menu
  const { data: settings } = useSWR<ContactSettings>(
    "/api/contact-settings",
    fetcher
  );

  const languages = [
    {
      code: "LT",
      name: "Lietuvių",
      flag: (
        <svg className="w-7 h-4" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#FDB462" />
          <rect width="30" height="6.67" y="6.67" fill="#006A44" />
          <rect width="30" height="6.66" y="13.33" fill="#C1272D" />
        </svg>
      ),
    },
    {
      code: "PL",
      name: "Polski",
      flag: (
        <svg className="w-7 h-4" viewBox="0 0 30 20">
          <rect width="30" height="10" fill="#FFFFFF" />
          <rect width="30" height="10" y="10" fill="#DC143C" />
        </svg>
      ),
    },
    {
      code: "EN",
      name: "English",
      flag: (
        <svg className="w-7 h-4" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1" />
          <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const menuItems = [
    { name: "Pagrindinis", href: "/" },
    { name: "Apie mus", href: "/apie" },
    { name: "Kelionių pasiūlymai", href: "/kelioniu-pasiulymai" },
    { name: "Kontaktai", href: "/contact" },
  ];

  return (
    <header className="relative z-10 mr-2 w-full bg-gray-50 shadow-xl">
      <div className="max-w-screen-2xl mx-auto px-1 sm:px-4 lg:px-14 py-2 flex items-center w-full justify-between">
        {/* Kairėje: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="krauklagamina Logo"
              width={163}
              height={120}
              className="w-[100px] h-[68px] sm:w-[140px] sm:h-[98px] lg:w-[163px] lg:h-[115px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        </div>
        {/* Nav desktop */}
        <nav className="hidden md:flex flex-1 lg:space-x-2 lg:ml-14 items-center gap-3 lg:gap-10 whitespace-nowrap mx-3 lg:mx-8">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-black hover:text-gray-700 transition-colors lg:text-xl font-semibold tracking-wide"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {item.name}
            </a>
          ))}
        </nav>
        {/* Dešinėje: Contact icons + Admin badge + Language selector desktop */}
        <div className="flex items-center gap-4">
          {/* Contact Icons Desktop */}
          {settings && (
            <div className="hidden md:flex items-center gap-3">
              {settings.defaultPhone && (
                <a
                  href={`tel:${settings.defaultPhone}`}
                  className="group flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105"
                  aria-label={`Skambinti ${settings.defaultPhone}`}
                  title={settings.defaultPhone}
                >
                  <MdPhone size={20} />
                </a>
              )}
              {settings.defaultEmail && (
                <a
                  href={`mailto:${settings.defaultEmail}`}
                  className="group flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300 hover:scale-105"
                  aria-label={`Rašyti ${settings.defaultEmail}`}
                  title={settings.defaultEmail}
                >
                  <MdEmail size={20} />
                </a>
              )}
              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
            </div>
          )}

          {/* Admin Badge */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ADMIN
              </span>
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Panel
              </Link>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
              >
                Atsijungti
              </button>
            </div>
          )}

          {/* Search Desktop */}
          {/* <button className="hidden md:flex text-black hover:text-gray-200 cursor-pointer">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
              />
            </svg>
          </button> */}
          {/* Language Selector desktop */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 text-black hover:text-gray-700 transition-colors cursor-pointer"
            >
              {languages.find((lang) => lang.code === currentLang)?.flag}
              <svg
                className={`w-6 h-6 transition-transform ${
                  isLangOpen ? "rotate-180" : ""
                }`}
                fill="black"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setIsLangOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {lang.flag}
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Mobile nav/search/lang + burger menu */}
          <div className="flex items-center md:hidden gap-2">
            {/* Contact Icons Mobile */}
            {settings && (
              <div className="flex items-center gap-1">
                {settings.defaultPhone && (
                  <a
                    href={`tel:${settings.defaultPhone}`}
                    className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                    aria-label={`Skambinti ${settings.defaultPhone}`}
                  >
                    <MdPhone size={14} />
                  </a>
                )}
                {settings.defaultEmail && (
                  <a
                    href={`mailto:${settings.defaultEmail}`}
                    className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300"
                    aria-label={`Rašyti ${settings.defaultEmail}`}
                  >
                    <MdEmail size={14} />
                  </a>
                )}
              </div>
            )}

            <nav className="flex items-center gap-3">
              {/* Search Mobile */}
              {/* <button className="text-black flex hover:text-gray-700 cursor-pointer mr-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" stroke="black" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="black" />
                </svg>
              </button> */}
              {/* Language Selector mobile */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-black hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {languages.find((lang) => lang.code === currentLang)?.flag}
                  <svg
                    className={`w-6 h-6 transition-transform ${
                      isLangOpen ? "rotate-180" : ""
                    }`}
                    fill="black"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setIsLangOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {lang.flag}
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Burger menu button mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-black hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Atidaryti meniu"
              >
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="black"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white opacity-95 backdrop-blur-sm rounded-sm shadow-lg mr-2 mx-4">
          {/* Menu Items */}
          <div className="px-4 py-3 space-y-2">
            {menuItems.map((item, idx) => (
              <a
                key={item.name}
                href={item.href}
                className={`block py-3 text-black hover:text-gray-700 transition-colors font-medium ${
                  idx < menuItems.length - 1 ? "border-b border-gray-200" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Contact Section */}
          {settings && (
            <div className="border-t border-gray-200 px-4 py-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Susisiekite su mumis
              </h3>

              {/* Contact Links */}
              <div className="space-y-2 mb-4">
                {settings.defaultPhone && (
                  <a
                    href={`tel:${settings.defaultPhone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-1"
                  >
                    <MdPhone size={18} className="text-blue-500" />
                    <span className="text-sm">{settings.defaultPhone}</span>
                  </a>
                )}
                {settings.defaultEmail && (
                  <a
                    href={`mailto:${settings.defaultEmail}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-1"
                  >
                    <MdEmail size={18} className="text-blue-500" />
                    <span className="text-sm">{settings.defaultEmail}</span>
                  </a>
                )}
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">Sekite mus:</span>
                <div className="flex gap-3">
                  {settings.defaultFacebook && (
                    <a
                      href={settings.defaultFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="Facebook"
                    >
                      <FaFacebook size={20} />
                    </a>
                  )}
                  {settings.defaultInstagram && (
                    <a
                      href={settings.defaultInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 transition-colors"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
