type AdzunaJob = {
  title: string;
  company: string;
  location: string;
  pay: string;
  why: string;
  url: string;
};

export async function searchJobs(filters: {
  keywords: string;
  location: string | null;
  country: string | null;
  remote: boolean;
}) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  const country = filters.country ?? "us";

  const params = new URLSearchParams({
    app_id: appId!,
    app_key: appKey!,
    results_per_page: "3",
    what: filters.keywords,
  });

  if (filters.location) {
    params.set("where", filters.location);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Adzuna request failed: ${res.status}`);
  }

  const data = await res.json();

  const jobs: AdzunaJob[] = (data.results ?? []).map((job: any) => ({
    title: job.title,
    company: job.company?.display_name ?? "Unknown company",
    location: job.location?.display_name ?? "Not specified",
    pay: job.salary_min && job.salary_max
      ? `$${Math.round(job.salary_min)}-${Math.round(job.salary_max)}`
      : "Not listed",
    why: "",
    url: job.redirect_url,
  }));

  return jobs;
}