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

function normalizePath(path: string) {
  return path
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\.\.(\/|$)/g, "");
}

export function parseGeneratedProject(result: string | null | undefined): ParsedGeneration | null {
  if (!result) return null;

  const candidate = result.match(JSON_BLOCK_REGEX)?.[1]?.trim() || result.trim();

  try {
    const parsed = JSON.parse(candidate) as RawGenerationShape;

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
