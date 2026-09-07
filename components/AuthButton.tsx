type Props = {
  isLoggedIn: boolean;
  onToggle: () => void;
  onOpenSidebar: () => void;
};

export default function AuthButton({ isLoggedIn, onToggle, onOpenSidebar }: Props) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-start justify-between sm:left-auto">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm sm:hidden"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#69ABF7"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        onClick={onToggle}
        className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
      >
        {isLoggedIn ? "Log out" : "Log in"}
      </button>
    </div>
  );
}