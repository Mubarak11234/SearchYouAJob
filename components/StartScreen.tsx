import Image from "next/image";

type Props = {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  loading: boolean;
};

export default function StartScreen({ message, setMessage, onSend, loading }: Props) {
  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center gap-6 px-4">
      <Image src="/searchYouAJobIcon.png" alt="Search Your Job" width={56} height={56} />
      <h1 
        className="font-medium text-zinc-700 text-center" 
        style={{ fontSize: "clamp(20px, 4vw, 32px)" }} 
      > 
        Find jobs with AI 
      </h1>

      <div
        className="flex items-center gap-3 rounded-full bg-white shadow-lg shadow-black/10 border border-zinc-100"
        style={{ width: "min(1000px, 92vw)", padding: "12px 24px" }}
      >
        <input
          type="text"
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onSend()}
          placeholder="Find me remote junior data analyst roles..."
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400 min-w-0 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
          style={{ backgroundColor: "#69ABF7" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}