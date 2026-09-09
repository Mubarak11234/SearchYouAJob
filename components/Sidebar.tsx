import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Conversation = {
  id: string;
  title: string;
  messages: unknown[];
};

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  isOpen,
  onClose,
}: Props) {
  const content = (
    <>
      <div className="mb-6 flex items-center gap-2 ">
        <Image src="/searchYouAJobIcon.png" alt="SearchYouAJob" width={32} height={32} />
        <h1 className="font-semibold text-zinc-800">SearchYouAJob</h1>
      </div>

      <button
        onClick={() => {
          onNewChat();
          onClose();
        }}
        className="mb-6 flex items-center gap-2 px-1 py-1 text-left text-sm text-zinc-700 hover:opacity-80"
      >
        <span className="text-xl font-bold leading-none" style={{ color: "#69ABF7" }}>
          +
        </span>
        <span>New chat</span>
      </button>

      <p className="mb-2 px-1 text-xs font-medium text-zinc-500">RECENT</p>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="px-2 text-sm text-zinc-400">No searches yet</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => {
              onSelectConversation(c.id);
              onClose();
            }}
            className={
              c.id === activeId
                ? "cursor-pointer truncate rounded-lg px-2 py-2 text-sm font-medium"
                : "cursor-pointer truncate rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            }
            style={c.id === activeId ? { backgroundColor: "#EAF1FD", color: "#2E5C8A" } : undefined}
          >
            {c.title || "New chat"}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: always visible, static sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 p-4 sm:flex">
        {content}
      </aside>

      {/* Mobile: slide-in overlay sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white p-4 shadow-xl sm:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}