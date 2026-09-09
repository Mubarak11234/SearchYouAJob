"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import JobCard from "@/components/JobCard";
import StreamingText from "@/components/StreamingText";
import LoadingIndicator from "@/components/LoadingIndicator";

type Job = {
  title: string;
  company: string;
  location: string;
  pay: string;
  why: string;
  url?: string;
};

type Message = {
  role: "user" | "mentor";
  text: string;
  jobs?: Job[];
};

type Props = {
  messages: Message[];
  loading?: boolean;
};

export default function ChatView({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col overflow-y-auto py-6 pb-40">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          className="mb-5 flex flex-col"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {m.role === "user" ? (
            <div className="mb-1 max-w-[85%] self-end rounded-2xl bg-zinc-100 px-4 py-2">
              {m.text}
            </div>
          ) : (
            <div className="mb-1 self-start px-1 text-sm text-zinc-700">
              <StreamingText
                text={m.text}
                onUpdate={() => {
                  bottomRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                  });
                }}
              />
            </div>
          )}

          {m.jobs && (
            <div className="mt-2 flex w-full flex-col gap-3 self-start">
              {m.jobs.map((job, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: 0.3 + j * 0.06,
                  }}
                >
                  <JobCard {...job} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ))}

      {loading && <LoadingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}