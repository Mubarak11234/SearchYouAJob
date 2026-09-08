"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import StartScreen from "@/components/StartScreen";
import ChatView from "@/components/ChatView";
import AuthButton from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

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

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

const FAKE_JOBS: Job[] = [
  {
    title: "Junior Data Analyst",
    company: "Fieldstone & Co.",
    location: "Remote",
    pay: "$32k–40k",
    why: "SQL is the only required skill listed; Python is optional.",
  },
  {
    title: "Data Analyst, Entry Level",
    company: "Harbor Analytics",
    location: "Remote (US/EU)",
    pay: "$35k–44k",
    why: "No degree requirement. Asks for one SQL project in the application.",
  },
  {
    title: "Junior Analytics Associate",
    company: "Loomis Retail Group",
    location: "Remote",
    pay: "$30k–36k",
    why: "Lower pay band, but explicitly open to first-time analysts.",
  },
];

function makeId() {
  return crypto.randomUUID();
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const started = activeConversation !== null;

  // Get the current logged-in user's id once on load, and whenever auth state changes.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load this user's existing conversations + messages from Supabase.
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      return;
    }

    async function loadConversations() {
      const { data: convoRows, error: convoError } = await supabase
        .from("conversations")
        .select("id, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (convoError || !convoRows) {
        console.error("Failed to load conversations:", convoError);
        return;
      }

      const loaded: Conversation[] = [];

      for (const convo of convoRows) {
        const { data: msgRows, error: msgError } = await supabase
          .from("messages")
          .select("role, content, jobs")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: true });

        if (msgError || !msgRows) {
          console.error("Failed to load messages:", msgError);
          continue;
        }

        loaded.push({
          id: convo.id,
          title: convo.title,
          messages: msgRows.map((m) => ({
            role: m.role as "user" | "mentor",
            text: m.content,
            jobs: m.jobs ?? undefined,
          })),
        });
      }

      setConversations(loaded);
    }

    loadConversations();
  }, [userId]);

  function handleNewChat() {
    setActiveId(null);
    setMessage("");
    setLoading(false);
  }

  function handleSelectConversation(id: string) {
    setActiveId(id);
    setMessage("");
  }

  async function handleSend() {
    if (!message.trim() || loading || !userId) return;

    const userMessage: Message = { role: "user", text: message };
    let targetId = activeId;

    if (!targetId) {
      targetId = makeId();
      const title = message.slice(0, 40);

      const newConversation: Conversation = {
        id: targetId,
        title,
        messages: [userMessage],
      };
      setConversations((prev) => [newConversation, ...prev]);
      setActiveId(targetId);

      await supabase.from("conversations").insert({
        id: targetId,
        user_id: userId,
        title,
      });
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, userMessage] } : c
        )
      );
    }

    await supabase.from("messages").insert({
      conversation_id: targetId,
      role: "user",
      content: userMessage.text,
    });

    setMessage("");
    setLoading(true);

    const finalId = targetId;

    // TODO(backend): replace this setTimeout with a real call to
    // app/api/chat/route.ts (LangGraph -> Gemini -> Adzuna -> Gemini, streamed).
    setTimeout(async () => {
      const mentorMessage: Message = {
        role: "mentor",
        text: "Found a few postings that match what you're after. The first two are worth a close look.",
        jobs: FAKE_JOBS,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === finalId ? { ...c, messages: [...c.messages, mentorMessage] } : c
        )
      );
      setLoading(false);

      await supabase.from("messages").insert({
        conversation_id: finalId,
        role: "mentor",
        content: mentorMessage.text,
        jobs: mentorMessage.jobs,
      });
    }, 1200);
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex flex-1 flex-col items-center px-4">
      {/* <AuthButton onOpenSidebar={() => setSidebarOpen(true)} /> */}
      <AuthButton onOpenSidebar={() => setSidebarOpen(true)} />
        <AnimatePresence mode="wait">
          {!started && (
            <motion.div
              key="start"
              className="flex flex-1 w-full flex-col items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <StartScreen message={message} setMessage={setMessage} onSend={handleSend} loading={loading} />
            </motion.div>
          )}

          {started && activeConversation && (
            <motion.div
              key={activeConversation.id}
              className="flex flex-1 w-full flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <ChatView messages={activeConversation.messages} />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                className="mb-6 flex items-center gap-3 rounded-full bg-white shadow-lg shadow-black/10 border border-zinc-100"
                style={{ width: "min(1000px, 92vw)", padding: "12px 24px" }}
              >
                <input
                  type="text"
                  value={message}
                  disabled={loading}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                  placeholder={loading ? "Thinking..." : "Ask a follow-up..."}
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400 min-w-0 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
                  style={{ backgroundColor: "#69ABF7" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}