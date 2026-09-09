import { extractSearchFilters, generateMentorResponse } from "@/lib/gemini";
import { searchJobs } from "@/lib/adzuna";

export async function POST(request: Request) {
  const body = await request.json();
  const userMessage: string = body.message;
  const history: { role: string; text: string }[] = body.history ?? [];

  if (!userMessage || typeof userMessage !== "string") {
    return Response.json({ error: "Missing message" }, { status: 400 });
  }

  try {
    const filters = await extractSearchFilters(userMessage);
    const jobs = await searchJobs(filters);
    const mentorText = await generateMentorResponse(userMessage, jobs, history);

    return Response.json({ text: mentorText, jobs });
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json(
      { error: "Something went wrong finding jobs. Try again." },
      { status: 500 }
    );
  }
}