import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.5-flash-lite",
  temperature: 0.3,
});

const SUPPORTED_COUNTRIES = [
  "gb", "us", "de", "fr", "au", "nz", "ca", "in",
  "pl", "br", "at", "za", "nl", "it", "es", "sg", "ch", "mx",
];

function contentToText(content: unknown): string {
  return typeof content === "string" ? content : JSON.stringify(content);
}

export async function extractSearchFilters(userMessage: string) {
  const prompt = `You are a job search assistant. Extract search filters from the user's message below.

Correct any obvious spelling mistakes or typos in place names, job titles, and keywords before extracting them (e.g. "los angles" should become "Los Angeles").

Also resolve informal, regional, or nickname place references to a real, searchable location. For example, "Silicon Valley" is not a single city, it's a tech-hub region spanning several cities (San Jose, Palo Alto, Mountain View, Sunnyvale, Santa Clara). When you see a regional nickname like this, pick the single most central/well-known city that best represents it (e.g. "Silicon Valley" → "San Jose") rather than leaving the nickname as-is, since a literal search for "Silicon Valley" as a place name will return no results. Apply the same logic to other regional nicknames (e.g. "the Big Apple" → "New York", "the Windy City" → "Chicago").

The "country" field must be one of these Adzuna country codes ONLY: ${SUPPORTED_COUNTRIES.join(", ")}.
Map any country reference the user gives, including colloquial, informal, historical, or slang names for a country (e.g. "Hindustan" means India → "in", casual/slang references to America mean the United States → "us"), to the closest matching code from that list.
If no country is mentioned or you can't confidently match one, use null.

Respond with ONLY valid JSON, no other text, no markdown formatting, in exactly this shape:
{"keywords": string, "location": string | null, "country": string | null, "remote": boolean}

User message: "${userMessage}"`;

  const response = await gemini.invoke(prompt);
  const text = contentToText(response.content);

  try {
    const parsed = JSON.parse(text);
    if (parsed.country && !SUPPORTED_COUNTRIES.includes(parsed.country)) {
      parsed.country = null;
    }
    return parsed;
  } catch {
    return { keywords: userMessage, location: null, country: null, remote: false };
  }
}

export async function generateMentorResponse(
  userMessage: string,
  jobs: { title: string; company: string; location: string; pay: string }[],
  history: { role: string; text: string }[] = []
) {
  const historyText = history
    .map((m) => `${m.role === "user" ? "User" : "Mentor"}: ${m.text}`)
    .join("\n");

  const prompt = `You are a friendly, direct job search mentor talking to someone looking for work.

${historyText ? `Recent conversation so far:\n${historyText}\n` : ""}
The user just said: "${userMessage}"

Here are the job listings found for them:
${JSON.stringify(jobs, null, 2)}

Write a short, natural reply (2-3 sentences max) introducing these results, as if you're a mentor pointing someone toward good options. Take the earlier conversation into account if relevant, don't repeat yourself. Don't just list the jobs, that's shown separately below your message.

If the user's request was missing useful detail (like location, experience level, or job type), briefly mention that and invite them to share more, while still presenting what you found based on what they gave you.

Respond with ONLY the reply text, no formatting, no quotes around it.`;

  const response = await gemini.invoke(prompt);
  return contentToText(response.content).trim();
}