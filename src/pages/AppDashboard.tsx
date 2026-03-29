import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, LogOut, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreditsInfoDialog from "@/components/CreditsInfoDialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  stack: string | null;
  status: string;
  created_at: string;
}

const AppDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<number>(5);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { toast } = useToast();
  const quickStartHandledRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    loadProjects();
    loadCredits();
  }, [user]);

  useEffect(() => {
    if (!user || quickStartHandledRef.current) return;

    const promptFromLanding = localStorage.getItem("landing_quick_prompt")?.trim();
    if (!promptFromLanding) return;

    quickStartHandledRef.current = true;
    localStorage.removeItem("landing_quick_prompt");

    const autoCreate = async () => {
      const projectName = promptFromLanding.slice(0, 120);
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: projectName, description: null, user_id: user.id })
        .select()
        .single();

      if (error || !data) {
        toast({
          title: "Не удалось создать проект",
          description: error?.message || "Попробуйте снова",
          variant: "destructive",
        });
        return;
      }

      navigate(`/app/project/${data.id}`);
    };

    autoCreate();
  }, [navigate, toast, user]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as Project[]);
  };

  const loadCredits = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("check_and_reset_credits", { p_user_id: user.id });
    if (typeof data === "number") setCredits(data);
  };

  const createProject = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, user_id: user!.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    setShowNew(false);
    setNewName("");
    setNewDesc("");
    loadProjects();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-foreground tracking-tight">Lurk Dev</Link>
        <div className="flex items-center gap-4">
          <CreditsInfoDialog credits={credits} />
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Мои проекты</h1>
          <Button onClick={() => setShowNew(true)} className="gradient-primary text-primary-foreground border-0">
            <Plus className="w-4 h-4 mr-1" /> Новый проект
          </Button>
        </div>


        {credits <= 0 && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            You've reached your limit. Next credits refresh at 00:00 (Europe/Moscow).
          </div>
        )}

        {showNew && (
          <div className="gradient-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-semibold mb-4">Новый проект</h3>
            <div className="space-y-3">
              <Input placeholder="Название проекта" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-background border-border" />
              <Input placeholder="Описание (необязательно)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-background border-border" />
              <div className="flex gap-2">
                <Button onClick={createProject} className="gradient-primary text-primary-foreground border-0">Создать</Button>
                <Button variant="ghost" onClick={() => setShowNew(false)} className="text-muted-foreground">Отмена</Button>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас пока нет проектов</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/app/project/${p.id}`} className="gradient-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors block">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">{p.name}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ru")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AppDashboard;
