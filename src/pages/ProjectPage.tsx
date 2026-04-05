import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportProjectAsZip } from "@/lib/exportZip";
import { parseGeneratedProject } from "@/lib/generatedProject";
import CreditsInfoDialog from "@/components/CreditsInfoDialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Project {
  id: string;
  name: string;
  description: string | null;
  stack: string | null;
  status: string;
}

interface Generation {
  id: string;
  prompt: string;
  result: string | null;
  created_at: string;
}

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [credits, setCredits] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<"fast" | "balanced" | "deep">("balanced");
  const [generating, setGenerating] = useState(false);
  const autoStartHandledRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !id) return;
    loadProject();
    loadGenerations();
    loadCredits();
  }, [user, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generations]);

  const loadProject = async () => {
    const { data } = await supabase.from("projects").select("*").eq("id", id!).single();
    if (data) setProject(data as Project);
  };

  const loadGenerations = async () => {
    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("project_id", id!)
      .order("created_at", { ascending: true });
    if (data) setGenerations(data as Generation[]);
  };

  const loadCredits = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("check_and_reset_credits", { p_user_id: user.id });
    if (typeof data === "number") setCredits(data);
  };

  const runGeneration = async (promptText: string) => {
    if (!promptText.trim() || generating) return;
    if (credits <= 0) {
      toast({ title: "Нет кредитов", description: "Кредиты обновятся завтра в 00:00 МСК", variant: "destructive" });
      return;
    }

    setGenerating(true);
    const currentPrompt = promptText;
    setPrompt("");

    try {
      // Insert generation record
      const { data: gen, error: genErr } = await supabase
        .from("generations")
        .insert({ project_id: id!, prompt: currentPrompt })
        .select()
        .single();
      if (genErr) throw genErr;

      // Deduct credit
      const { error: creditErr } = await supabase
        .from("credits")
        .update({ credits: credits - 1 })
        .eq("user_id", user!.id);
      if (creditErr) throw creditErr;

      setCredits((c) => c - 1);

      // Call AI
      const { data: aiData, error: aiErr } = await supabase.functions.invoke("generate-project", {
        body: { prompt: currentPrompt, projectName: project?.name, projectDescription: project?.description },
      });

      if (aiErr) throw aiErr;

      const result = aiData?.result || "Не удалось сгенерировать ответ.";

      // Update generation with result
      await supabase
        .from("generations")
        .update({ result })
        .eq("id", (gen as Generation).id);

      loadGenerations();
    } catch (err: any) {
      toast({ title: "Ошибка генерации", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const intentPresets = [
    { label: "Новый экран", value: "Сделай новый экран с продуманным UX и адаптивной версткой." },
    { label: "Прокачать UI", value: "Улучши текущий UI: отступы, типографику, контраст и визуальную иерархию." },
    { label: "Новая функция", value: "Добавь новый функционал с UI, логикой и состояниями загрузки/ошибки." },
    { label: "Рефакторинг", value: "Сделай рефакторинг кода без поломки поведения и с более чистой структурой." },
  ];

  const depthInstructions: Record<"fast" | "balanced" | "deep", string> = {
    fast: "Сделай коротко и быстро, только самое важное.",
    balanced: "Дай сбалансированное решение: качество + скорость.",
    deep: "Сделай максимально тщательно: продумай UX-детали, edge-cases и структуру кода.",
  };

  const buildPrompt = () => {
    const parts = [prompt.trim()];
    if (selectedIntent) {
      parts.push(`Контекст задачи: ${selectedIntent}`);
    }
    parts.push(`Режим выполнения: ${depthInstructions[selectedDepth]}`);
    return parts.filter(Boolean).join("\n\n");
  };

  const handleGenerate = async () => {
    await runGeneration(buildPrompt());
  };

  const copyGenerationCode = async (result: string) => {
    const parsed = parseGeneratedProject(result);
    if (!parsed) {
      toast({
        title: "Нечего копировать",
        description: "Ответ не содержит распознанной структуры файлов.",
        variant: "destructive",
      });
      return;
    }

    const payload = parsed.files
      .map((file) => `// FILE: ${file.path}\n${file.content}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(payload);
      toast({ title: "Код скопирован", description: "Код файлов добавлен в буфер обмена." });
    } catch {
      toast({
        title: "Не удалось скопировать",
        description: "Браузер заблокировал доступ к буферу обмена.",
        variant: "destructive",
      });
    }
  };

  const downloadGenerationCode = async (result: string, generationId: string) => {
    const parsed = parseGeneratedProject(result);
    if (!parsed) {
      toast({
        title: "Нечего скачивать",
        description: "Ответ не содержит распознанной структуры файлов.",
        variant: "destructive",
      });
      return;
    }

    const zip = new JSZip();
    parsed.files.forEach((file) => zip.file(file.path, file.content));
    zip.file(
      "README.md",
      `# ${project?.name || "project"}\n\nГенерация: ${generationId}\n\nСобрано в Lurk Dev.`,
    );
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${(project?.name || "project").replace(/\s+/g, "_").toLowerCase()}_${generationId.slice(0, 8)}.zip`);
  };

  useEffect(() => {
    if (!id || !project || autoStartHandledRef.current || generating) return;

    const autostartPrompt = localStorage.getItem(`project_autostart_prompt:${id}`)?.trim();
    if (!autostartPrompt) return;

    if (generations.length > 0) {
      localStorage.removeItem(`project_autostart_prompt:${id}`);
      autoStartHandledRef.current = true;
      return;
    }

    autoStartHandledRef.current = true;
    localStorage.removeItem(`project_autostart_prompt:${id}`);
    void runGeneration(autostartPrompt);
  }, [generating, generations.length, id, project]);

  if (loading || !project) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="text-foreground font-semibold">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={generations.filter(g => g.result).length === 0}
            onClick={() => exportProjectAsZip(project.name, generations)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4 mr-1" /> ZIP
          </Button>
          <CreditsInfoDialog credits={credits} />
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Project info */}
        <aside className="lg:w-80 border-b lg:border-b-0 lg:border-r border-border p-6 shrink-0">
          <h2 className="text-foreground font-bold text-lg mb-3">{project.name}</h2>
          {project.description && <p className="text-sm text-muted-foreground mb-4">{project.description}</p>}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Стек</span>
              <span className="text-foreground">{project.stack || "Не указан"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Статус</span>
              <span className="text-foreground capitalize">{project.status}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Генерации</span>
              <span className="text-foreground">{generations.length}</span>
            </div>
          </div>
        </aside>

        {/* Right: Chat + Results */}
        <main className="flex-1 flex flex-col min-h-0">
          {credits <= 0 && (
            <div className="mx-6 mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              You've reached your limit. Next credits refresh at 00:00 (Europe/Moscow).
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {generations.length === 0 && (
              <div className="text-center text-muted-foreground py-20">
                <p className="text-lg mb-2">Начните генерацию</p>
                <p className="text-sm">Опишите, что хотите создать</p>
              </div>
            )}
            {generations.map((g) => (
              <div key={g.id} className="space-y-3">
                {/* User prompt */}
                <div className="flex justify-end">
                  <div className="gradient-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 max-w-lg text-sm">
                    {g.prompt}
                  </div>
                </div>
                {/* AI result */}
                {g.result && (
                  <div className="flex justify-start">
                    <div className="gradient-card border border-border rounded-2xl rounded-bl-md px-4 py-3 max-w-2xl">
                      {(() => {
                        const parsed = parseGeneratedProject(g.result);

                        if (!parsed) {
                          return <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">{g.result}</pre>;
                        }

                        return (
                          <div className="space-y-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{parsed.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => void copyGenerationCode(g.result)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Копировать код
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void downloadGenerationCode(g.result, g.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Скачать код
                              </Button>
                            </div>
                            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Файлы проекта</p>
                              <ul className="space-y-1">
                                {parsed.files.slice(0, 12).map((file) => (
                                  <li key={file.path} className="text-xs text-foreground font-mono">{file.path}</li>
                                ))}
                              </ul>
                              {parsed.files.length > 12 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  + ещё {parsed.files.length - 12} файлов
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {generating && (
              <div className="flex justify-start">
                <div className="gradient-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Генерация...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {intentPresets.map((intent) => (
                  <button
                    key={intent.label}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedIntent === intent.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setSelectedIntent((prev) => (prev === intent.value ? null : intent.value))}
                    disabled={generating || credits <= 0}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-background p-3">
                <Textarea
                  placeholder="Опиши задачу максимально конкретно: что изменить, где, и какой ожидается результат..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-y border-0 px-1 py-0 shadow-none focus-visible:ring-0"
                  disabled={generating || credits <= 0}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Режим:</span>
                    <button type="button" onClick={() => setSelectedDepth("fast")} className="bg-transparent">
                      <Badge variant={selectedDepth === "fast" ? "default" : "secondary"}>Быстро</Badge>
                    </button>
                    <button type="button" onClick={() => setSelectedDepth("balanced")} className="bg-transparent">
                      <Badge variant={selectedDepth === "balanced" ? "default" : "secondary"}>Баланс</Badge>
                    </button>
                    <button type="button" onClick={() => setSelectedDepth("deep")} className="bg-transparent">
                      <Badge variant={selectedDepth === "deep" ? "default" : "secondary"}>Глубоко</Badge>
                    </button>
                  </div>

                  <Button type="submit" disabled={generating || !prompt.trim() || credits <= 0} className="gradient-primary text-primary-foreground border-0">
                    <Send className="w-4 h-4 mr-2" />
                    Отправить
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectPage;
