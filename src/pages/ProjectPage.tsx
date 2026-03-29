import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Zap, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportProjectAsZip } from "@/lib/exportZip";
import { parseGeneratedProject } from "@/lib/generatedProject";

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
  const [generating, setGenerating] = useState(false);
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

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    if (credits <= 0) {
      toast({ title: "Нет кредитов", description: "Кредиты обновятся завтра в 00:00 МСК", variant: "destructive" });
      return;
    }

    setGenerating(true);
    const currentPrompt = prompt;
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
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-accent" />
            <span>{credits} кредитов</span>
          </div>
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
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex gap-2">
              <Input
                placeholder="Опишите, что хотите сгенерировать..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-background border-border flex-1"
                disabled={generating}
              />
              <Button type="submit" disabled={generating || !prompt.trim()} className="gradient-primary text-primary-foreground border-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectPage;
