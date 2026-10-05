"use client";

import { MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { ContactSettings } from "../../data/types";
import { useTranslations } from "../../contexts/LanguageContext";

export default function Footer() {
  const { data: settings } = useSWR<ContactSettings>(
    "/api/contact-settings",
    fetcher
  );
  const tFooter = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kompanijos informacija */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {tFooter("companyName")}
            </h3>
            <p className="text-gray-300 text-sm">
              {tFooter("companyDescription")}
            </p>
          </div>

          {/* Rekvizitai */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {tFooter("companyDetailsTitle")}
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                <span className="text-gray-400">{tFooter("companyCodeLabel")}: </span>
                {tFooter("companyCode")}
              </p>
              <p>
                <span className="text-gray-400">{tFooter("address")}: </span>
                {tFooter("addressValue")}
              </p>
              <p>
                <span className="text-gray-400">{tFooter("workingHours")}: </span>
              </p>
              <p>{tFooter("workingHoursWeekdays")}</p>
              <p>{tFooter("workingHoursSaturday")}</p>
            </div>
          </div>

          {/* Socialiniai tinklai */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {tFooter("followUsTitle")}
            </h3>
            <div className="flex space-x-4">
              {settings?.defaultFacebook && (
                <a
                  href={settings.defaultFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
              )}
              {settings?.defaultInstagram && (
                <a
                  href={settings.defaultInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Kontaktai ir copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {settings?.defaultPhone && (
              <a
                href={`tel:${settings.defaultPhone}`}
                className="flex items-center text-gray-300 hover:text-white text-sm transition-colors"
              >
                <MdPhone className="mr-2 text-blue-400" size={16} />
                {settings.defaultPhone}
              </a>
            )}
            {settings?.defaultEmail && (
              <a
                href={`mailto:${settings.defaultEmail}`}
                className="flex items-center text-gray-300 hover:text-white text-sm transition-colors"
              >
                <MdEmail className="mr-2 text-blue-400" size={16} />
                {settings.defaultEmail}
              </a>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {tFooter("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
