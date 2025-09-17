"use client";
import { motion } from "framer-motion";

export default function RotatingBg() {
  return (
    <motion.div
      className="fixed inset-0 w-[205vw] h-[205vw] lg:w-[130vw] lg:h-[130vw] 2xl:w-[115vw] 2xl:h-[115vw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
      style={{
        backgroundImage: "url('/images/bg_image.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 0,
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
    />
  );
}
