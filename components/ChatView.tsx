import { motion } from "framer-motion";
import JobCard from "@/components/JobCard";
import StreamingText from "@/components/StreamingText";

type Job = {
  title: string;
  company: string;
  location: string;
  pay: string;
  why: string;
};

type Message = {
  role: "user" | "mentor";
  text: string;
  jobs?: Job[];
};

type Props = {
  messages: Message[];
};

export default function ChatView({ messages }: Props) {
  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col overflow-y-auto py-6">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          className="mb-5 flex flex-col"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {m.role === "user" ? (
            <div className="mb-1 self-end rounded-2xl bg-zinc-100 px-4 py-2">{m.text}</div>
          ) : (
            <div className="mb-1 self-start px-1 text-sm text-zinc-700">
              <StreamingText text={m.text} />
            </div>
          )}

          {m.jobs && (
            <div className="mt-2 flex flex-col gap-3 self-start w-full">
              {m.jobs.map((job, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + j * 0.1 }}
                >
                  <JobCard {...job} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}