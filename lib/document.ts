export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_PAGES = 50;

export function chunkText(text: string, pageNumber: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const size = 900;
  const overlap = 140;
  const chunks: { content: string; page_number: number }[] = [];

  for (let start = 0; start < normalized.length; start += size - overlap) {
    const content = normalized.slice(start, start + size).trim();
    if (content.length >= 80) chunks.push({ content, page_number: pageNumber });
  }
  return chunks;
}

export const studySystemPrompt = `You are StudySathi AI, a helpful study assistant for Indian college students.
Explain in simple English, Hindi, or Hinglish based on the student's language. Use only the supplied note context for factual claims. Cite supplied page numbers in a short Sources section. If the answer is not in the notes, say so plainly. Never invent details or source pages. Help students learn and revise; do not help with cheating in a live exam.`;
