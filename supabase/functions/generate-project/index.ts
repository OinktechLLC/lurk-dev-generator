import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildFallbackResult(prompt: string, projectName?: string | null) {
  return {
    summary: "Создал базовый лендинг-проект. Можно скачать ZIP и сразу запускать.",
    files: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: (projectName || "ai-landing").toLowerCase().replace(/\s+/g, "-"),
            private: true,
            version: "1.0.0",
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview",
            },
            dependencies: {
              react: "^18.3.1",
              "react-dom": "^18.3.1",
            },
            devDependencies: {
              vite: "^5.4.0",
              "@vitejs/plugin-react-swc": "^3.7.0",
            },
          },
          null,
          2,
        ),
      },
      {
        path: "index.html",
        content:
          "<!doctype html><html lang=\"ru\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /><title>AI Landing</title><script type=\"module\" src=\"/src/main.jsx\"></script></head><body><div id=\"root\"></div></body></html>",
      },
      {
        path: "src/main.jsx",
        content:
          "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport './styles.css';\n\nfunction App() {\n  return (\n    <main className=\"hero\">\n      <h1>Готовый лендинг</h1>\n      <p>Запрос: " + prompt.replaceAll("\n", " ") + "</p>\n      <button>Оставить заявку</button>\n    </main>\n  );\n}\n\ncreateRoot(document.getElementById('root')).render(<App />);",
      },
      {
        path: "src/styles.css",
        content:
          "*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#0b1020;color:#fff}.hero{min-height:100vh;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;text-align:center;padding:24px}.hero button{background:#6d5dfc;border:0;color:#fff;padding:12px 20px;border-radius:12px;cursor:pointer}",
      },
    ],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, projectName, projectDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Lurk Dev AI — a project generator assistant.
Generate REAL project files that can be launched locally.
Output ONLY strict JSON without markdown or extra text in this format:
{
  "summary": "short russian summary",
  "files": [
    { "path": "relative/file/path.ext", "content": "file content" }
  ]
}
Rules:
- Return at least 3 files.
- Paths must be valid relative paths.
- Content must be complete file contents.
- The project must match the user request and be runnable.
Project context: Name: "${projectName || "Unnamed"}", Description: "${projectDescription || "No description"}"
Respond in Russian.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const rawResult = data.choices?.[0]?.message?.content;

    let result = rawResult;

    try {
      const parsed = JSON.parse(rawResult);
      if (!Array.isArray(parsed?.files) || parsed.files.length === 0) {
        result = JSON.stringify(buildFallbackResult(prompt, projectName));
      }
    } catch {
      result = JSON.stringify(buildFallbackResult(prompt, projectName));
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-project error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
