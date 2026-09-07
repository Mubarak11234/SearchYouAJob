type Props = {
  title: string;
  company: string;
  location: string;
  pay: string;
  why: string;
};

export default function JobCard({ title, company, location, pay, why }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h4 className="font-semibold text-zinc-800">{title}</h4>
        <span className="text-sm text-zinc-500">{pay}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {company} — {location}
      </p>
      <p className="mt-2 text-sm text-zinc-600">{why}</p>
      <a href="#" className="mt-3 inline-block text-sm font-medium" style={{ color: "#69ABF7" }}>
        View listing →
      </a>
    </div>
  );
}