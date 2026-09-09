"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import StartScreen from "@/components/StartScreen";
import ChatView from "@/components/ChatView";
import AuthButton from "@/components/AuthButton";
import { supabase } from "@/lib/supabase";

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

  // Effect 1: track auth state, and migrate any guest conversations into
  // Supabase the moment someone logs in mid-session.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUserId = session?.user?.id ?? null;

      if (newUserId && !userId && conversations.length > 0) {
        for (const convo of conversations) {
          await supabase.from("conversations").insert({
            id: convo.id,
            user_id: newUserId,
            title: convo.title,
          });

          for (const msg of convo.messages) {
            await supabase.from("messages").insert({
              conversation_id: convo.id,
              role: msg.role,
              content: msg.text,
              jobs: msg.jobs,
            });
          }
        }
      }

      setUserId(newUserId);
    });

    return () => listener.subscription.unsubscribe();
  }, [userId, conversations]);

  // Effect 2: whenever userId changes, load that user's saved conversations
  // (or clear them out if logged out).
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
    if (!message.trim() || loading) return;

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

      if (userId) {
        await supabase.from("conversations").insert({
          id: targetId,
          user_id: userId,
          title,
        });
      }
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, userMessage] } : c
        )
      );
    }

    if (userId) {
      await supabase.from("messages").insert({
        conversation_id: targetId,
        role: "user",
        content: userMessage.text,
      });
    }

    setMessage("");
    setLoading(true);

    const finalId = targetId;

    try {
      const activeConvo = conversations.find((c) => c.id === targetId);
      const recentHistory = (activeConvo?.messages ?? []).slice(-6);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, history: recentHistory }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const mentorMessage: Message = {
        role: "mentor",
        text: data.text,
        jobs: data.jobs,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === finalId ? { ...c, messages: [...c.messages, mentorMessage] } : c
        )
      );

      if (userId) {
        await supabase.from("messages").insert({
          conversation_id: finalId,
          role: "mentor",
          content: mentorMessage.text,
          jobs: mentorMessage.jobs,
        });
      }
    } catch (error) {
      console.error("Failed to get mentor response:", error);
      const errorMessage: Message = {
        role: "mentor",
        text: "Sorry, something went wrong finding jobs. Try again in a moment.",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === finalId ? { ...c, messages: [...c.messages, errorMessage] } : c
        )
      );
    } finally {
      setLoading(false);
    }
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

      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4">
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
              <ChatView messages={activeConversation.messages} loading={loading} />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-white shadow-lg shadow-black/10 border border-zinc-100"
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