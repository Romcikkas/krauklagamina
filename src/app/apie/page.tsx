"use client";

import { motion } from "framer-motion";
import {
  MdTravelExplore,
  MdLocationOn,
  MdPeople,
  MdSupport,
  MdVerified,
  MdTrendingUp,
} from "react-icons/md";
import { FaHandshake, FaHeart } from "react-icons/fa";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const teamMembers = [
  {
    name: "Evelina Navickienė",
    role: "Įkūrėja ir generalinė direktorė",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80",
    description:
      "15 metų patirtis kelionių srityje. Specializuojasi egzotiškų kelionių organizavime.",
  },
  {
    name: "Mindaugas Petrauskas",
    role: "Kelionių ekspertas",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    description:
      "Aplankė 40+ šalių. Specialistas kultūrinių ir nuotykių kelionių srityje.",
  },
  {
    name: "Laura Kazlauskienė",
    role: "Klientų aptarnavimo vadovė",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    description:
      "Užtikrina, kad kiekvienas klientas jaustųsi ypatingas ir išgirstas.",
  },
];

const stats = [
  { number: "100+", label: "Laimingų klientų", icon: MdPeople },
  { number: "50+", label: "Šalių", icon: MdLocationOn },
  //   { number: "5", label: "Metų patirtis", icon: MdStar },
  { number: "24/7", label: "Palaikymas", icon: MdSupport },
];

const values = [
  {
    icon: MdVerified,
    title: "Patikimumas",
    description:
      "Mes laikomės visų pažadų ir užtikriname aukščiausios kokybės paslaugas.",
  },
  {
    icon: FaHeart,
    title: "Aistra kelionėms",
    description:
      "Mūsų komandos nariai - tikri kelionių entuziastai, kurie myli tą, ką daro.",
  },
  {
    icon: MdTrendingUp,
    title: "Nuolatinis tobulėjimas",
    description:
      "Visada ieškome naujų būdų pagerinti mūsų paslaugas ir klientų patirtį.",
  },
  {
    icon: FaHandshake,
    title: "Individualus požiūris",
    description:
      "Kiekviena kelionė yra unikalus projektas, pritaikytas jūsų poreikiams.",
  },
];

export default function ApieMusPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-5 md:pt-0">
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 border border-white/20 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MdTravelExplore size={24} />
              Jūsų kelionių partneriai nuo 2016 metų
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Apie mus
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Jūsų kelionių partneris, kuris tiki, kad kelionės keičia žmonių
              gyvenimą. Mūsų misija - padėti jums atrasti pasaulį ir sukurti
              nepamirštamus prisiminimus.
            </motion.p>

            <motion.div
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                >
                  <stat.icon className="mx-auto mb-3 text-white" size={32} />
                  <div className="text-xl md:text-3xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mūsų istorija
              </h2>
              <p className="text-lg text-gray-600 mb-2 leading-relaxed">
                Mūsų kelionių agentūra gimė iš didelės aistros kelionėms ir
                noros dalintis nepakartojamais potyriais su kitais. Įkūrėme
                įmonę su tikslu – padėti žmonėms atrasti pasaulį patogiai,
                saugiai ir už geriausias kainas.
              </p>
              <p className="text-lg text-gray-600 mb-2 leading-relaxed">
                Kiekviena kelionė mums – ne tik darbas, bet ir galimybė kurti
                prisiminimus, kurie išlieka visam gyvenimui. Nuo pirmos dienos
                siekėme, kad mūsų klientai jaustųsi ne tik kaip keliautojai, bet
                ir kaip mūsų partneriai šiame nuotykyje. Ši aistra ir
                atsidavimas iki šiol yra pagrindinė mūsų vertybė ir varomoji
                jėga.
              </p>
              {/*Sertifikuota agentura, tarptautine patirtis */}
              {/* <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaAward className="text-yellow-500" size={24} />
                  <span className="font-semibold text-gray-900">
                    Sertifikuota agentūra
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGlobeEurope className="text-blue-500" size={24} />
                  <span className="font-semibold text-gray-900">
                    Tarptautinė patirtis
                  </span>
                </div>
              </div> */}
            </motion.div>

            {/* Foto musu komanda with floating elements */}
            {/* <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Mūsų komanda"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-lg font-semibold">Mūsų komanda darbe</p>
                  <p className="text-sm opacity-90">Vilniaus biuras, 2024</p>
                </div>
              </div> */}

            {/* Floating Elements */}
            {/* <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-80 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 blur-xl"></div>
            </motion.div> */}
          </div>
        </div>
      </section>

      {/* Values Section */}
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
              Mūsų vertybės
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Šios vertybės formuoja visą mūsų veiklą ir santykius su klientais
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Susipažinkite su mūsų komanda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kiekvienas komandos narys - kelionių entuziatas su unikalia
              patirtimi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="group text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <MdVerified className="text-white" size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Pasiruošę savo kelionei?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Susisiekite su mumis ir pradėkime planuoti jūsų nepamirštamą
              kelionę jau šiandien!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/kelioniu-pasiulymai"
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Žiūrėti pasiūlymus
              </motion.a>
              <motion.a
                href="/contact"
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Susisiekti su mumis
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
