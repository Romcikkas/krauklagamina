"use client";

import { useState } from "react";
import { ContactSettings } from "../../data/types";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram, FaMapPin } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  // Fetch contact settings
  const { data: settings, isLoading } = useSWR<ContactSettings>(
    "/api/contact-settings",
    fetcher
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create mailto link
    const subject = encodeURIComponent(`Krauk lagaminą: ${formData.subject}`);
    const body = encodeURIComponent(`Vardas: ${formData.name}
El. paštas: ${formData.email}
Telefonas: ${formData.phone}

Žinutė:
${formData.message}`);

    const mailtoLink = `mailto:${
      settings?.defaultEmail || ""
    }?subject=${subject}&body=${body}`;

    // Use window.location only in browser environment
    if (typeof window !== "undefined") {
      window.location.href = mailtoLink;
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Kraunami kontaktai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Susisiekite su mumis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Turime klausimų dėl kelionių? Susisiekite su mumis bet kuriuo
              patogiu būdu!
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Kontaktinė informacija
            </h2>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <MdPhone className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Telefonas
                  </h3>
                  <a
                    href={`tel:${settings?.defaultPhone}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {settings?.defaultPhone || "Kraunama..."}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <MdEmail className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    El. paštas
                  </h3>
                  <a
                    href={`mailto:${settings?.defaultEmail}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {settings?.defaultEmail || "Kraunama..."}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaMapPin className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Adresas
                  </h3>
                  <p className="text-gray-600">
                    Vilniaus g. 123
                    <br />
                    01234 Vilnius, Lietuva
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sekite mus socialiniuose tinkluose
              </h3>
              <div className="flex space-x-4">
                {settings?.defaultFacebook && (
                  <a
                    href={settings.defaultFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook className="w-5 h-5 text-white" />
                  </a>
                )}
                {settings?.defaultInstagram && (
                  <a
                    href={settings.defaultInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  >
                    <FaInstagram className="w-5 h-5 text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          {/* <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Parašykite mums
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Vardas *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jūsų vardas"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  El. paštas *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jusu@gmail.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Telefonas
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+370 600 12345"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tema *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Klausimas dėl kelionės"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Žinutė *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Parašykite savo klausimą..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Siųsti žinutę
              </button>
            </form>
          </div> */}
        </div>

        {/* Working Hours */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Darbo laikas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pirmadienis - Penktadienis
              </h3>
              <p className="text-gray-600">9:00 - 18:00</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Šeštadienis
              </h3>
              <p className="text-gray-600">10:00 - 16:00</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sekmadienis
              </h3>
              <p className="text-gray-600">Nedirbame</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
