"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  speed?: number;
};

export default function StreamingText({ text, speed = 20 }: Props) {
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
        return c + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, words.length]);

  return <span>{words.slice(0, count).join(" ")}</span>;
}