"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const MESSAGES = [
  "Evaluating your search...",
  "Scanning listings...",
  "Matching your skills...",
  "Almost there...",
];

export default function LoadingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-5 flex items-center gap-3 self-start">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/searchYouAJobIcon.png" alt="" width={24} height={24} />
      </motion.div>
      <span className="text-sm text-zinc-500">{MESSAGES[messageIndex]}</span>
    </div>
  );
}