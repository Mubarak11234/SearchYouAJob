"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

type Props = {
  onOpenSidebar: () => void;
};

export default function AuthButton({ onOpenSidebar }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleClick() {
    if (email) {
      await supabase.auth.signOut();
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <div className="fixed top-4 left-4 right-4 z-50 flex items-start justify-between sm:left-auto">
        <button
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm sm:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#69ABF7" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={handleClick}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
        >
          {email ? "Log out" : "Log in"}
        </button>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}