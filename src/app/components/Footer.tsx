"use client";

import { MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { ContactSettings } from "../../data/types";

export default function Footer() {
  const { data: settings } = useSWR<ContactSettings>(
    "/api/contact-settings",
    fetcher
  );

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kompanijos informacija */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Krauk lagaminą</h3>
            <p className="text-gray-300 text-sm">
              Jūsų patikimas kelionių partneris. Organizuojame nepamirštamas
              keliones po visą pasaulį.
            </p>
          </div>

          {/* Kontaktai */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontaktai</h3>
            <div className="space-y-2">
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
          </div>

          {/* Socialiniai tinklai */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sekite mus</h3>
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

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Krauk lagaminą. Visos teisės
            saugomos.
          </p>
        </div>
      </div>
    </footer>
  );
}
