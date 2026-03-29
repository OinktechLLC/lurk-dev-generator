export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ParsedGeneration {
  summary: string;
  files: GeneratedFile[];
}

interface RawGenerationShape {
  summary?: unknown;
  files?: Array<{ path?: unknown; content?: unknown }>;
}

const JSON_BLOCK_REGEX = /```json\s*([\s\S]*?)```/i;
const GENERIC_BLOCK_REGEX = /```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/i;

function normalizePath(path: string) {
  return path
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\.\.(\/|$)/g, "");
}

export function parseGeneratedProject(result: string | null | undefined): ParsedGeneration | null {
  if (!result) return null;

  const normalized = result.trim();
  const candidate =
    result.match(JSON_BLOCK_REGEX)?.[1]?.trim() ||
    result.match(GENERIC_BLOCK_REGEX)?.[1]?.trim() ||
    normalized;
  const objectCandidate = extractFirstJsonObject(candidate) || extractFirstJsonObject(normalized) || candidate;

  try {
    const parsed = JSON.parse(objectCandidate) as RawGenerationShape;

    if (!Array.isArray(parsed.files)) return null;

    const files: GeneratedFile[] = parsed.files
      .map((file) => ({
        path: typeof file.path === "string" ? normalizePath(file.path) : "",
        content: typeof file.content === "string" ? file.content : "",
      }))
      .filter((file) => file.path.length > 0);

    if (files.length === 0) return null;

    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "Проект сгенерирован.",
      files,
    };
  } catch {
    return null;
  }
}

function extractFirstJsonObject(input: string) {
  const start = input.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }

  return null;
}
