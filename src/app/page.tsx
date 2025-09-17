"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const travelCards = [
  {
    img: "/images/homepage-cards/photo-1476514525535-07fb3b4ae5f1.jpg", // Santorini, Greece - gražus paplūdimys su mėlynais namais
    title: "Patrauklios kainos",
    desc: "Dėka daugiametės patirties ir bendradarbiavimo su partneriais siūlome žemas lėktuvų bilietų ir viešbučių kainas",
  },
  {
    img: "/images/homepage-cards/premium_photo-1700828284504-02bd8d5fb2d4.jpg", // Bali, Indonezija - egzotiškas paplūdimys su palmėmis
    title: "Egzotiškos kryptys",
    desc: "Siūlome keliones į gražiausius pasaulio kampelius, pritaikytus jūsų poreikiams ir lūkesčiams.",
  },
  {
    img: "/images/homepage-cards/photo-1591705153598-636cb119d2fd.jpg", // Kelionių konsultantas su klientu - profesionalus aptarnavimas
    title: "Pilnas palaikymas",
    desc: "Užtikriname visapusišką aptarnavimą ir pagalbą kiekviename kelionės etape.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section - Full Width, No Margins */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-4 sm:pt-0">
        {/* Background Image/Gradient - Full Width */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90"></div> */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <motion.div
              className="gap-2 inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-2xl ">✈️</span> Patikimas kelionių partneris
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Krauk lagaminą
              </span>
              <br />
              <span className="text-3xl md:text-5xl font-light text-blue-100">
                ir keliauk daugiau mokėdamas mažiau
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Atrask nepamirštamas keliones po visą pasaulį su mūsų ekspertų
              komanda. Geriausi pasiūlymai, profesionalus aptarnavimas.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.a
                href="/kelioniu-pasiulymai"
                className="group relative px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Žiūrėti keliones</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>

              <motion.a
                href="/contact"
                className="group px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Susisiekti su mumis
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  500+
                </motion.div>
                <div className="text-blue-200 text-sm">Laimingų klientų</div>
              </div>

              <div className="text-center">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                >
                  50+
                </motion.div>
                <div className="text-blue-200 text-sm">Šalių</div>
              </div>

              <div className="text-center">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  5+
                </motion.div>
                <div className="text-blue-200 text-sm">Metų patirtis</div>
              </div>

              <div className="text-center">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                >
                  24/7
                </motion.div>
                <div className="text-blue-200 text-sm">Palaikymas</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kodėl rinktis mus?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mūsų komanda užtikrina, kad jūsų kelionė būtų ne tik saugi, bet ir
              nepamirštama
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelCards.map((card, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <Image
                    src={card.img}
                    alt={card.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
