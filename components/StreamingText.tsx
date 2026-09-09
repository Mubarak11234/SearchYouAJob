"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  speed?: number;
  onUpdate?: () => void;
};

export default function StreamingText({ text, speed = 20, onUpdate }: Props) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= words.length) {
          clearInterval(interval);
          return c;
        }
        const next = c + 1;
        onUpdate?.();
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, words.length]);

  return <span>{words.slice(0, count).join(" ")}</span>;
}