"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingIndicator() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((current) => {
        if (current.length >= 5) return "";
        return current + ".";
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 py-6">
      <motion.div
        animate={{
          scale: [1, 0.88, 1],
          opacity: [1, 0.4, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(105,171,247,0))",
            "drop-shadow(0 0 12px rgba(105,171,247,0.8))",
            "drop-shadow(0 0 0px rgba(105,171,247,0))",
          ],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/searchYouAJobIcon.png"
          alt="Fetching"
          width={32}
          height={32}
        />
      </motion.div>

      <span className="text-sm text-zinc-500">
        Fetching{dots}
      </span>
    </div>
  );
}