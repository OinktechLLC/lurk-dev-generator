import { Link } from "react-router-dom";
import { Zap, Shield, Clock, Sparkles, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, title: "AI-генерация", desc: "Опишите идею — получите готовый проект за секунды" },
  { icon: Code, title: "Любой стек", desc: "React, Vue, Node.js и другие технологии на выбор" },
  { icon: Shield, title: "Безопасность", desc: "Данные защищены и хранятся в облаке" },
  { icon: Zap, title: "Быстрый старт", desc: "5 бесплатных генераций каждый день" },
  { icon: Clock, title: "История", desc: "Все проекты сохраняются в вашем аккаунте" },
  { icon: Layers, title: "Итерации", desc: "Дорабатывайте проект через чат с ИИ" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <span className="text-xl font-bold text-foreground tracking-tight">Lurk Dev</span>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Войти
            </Button>
          </Link>
          <Link to="/auth?tab=register">
            <Button size="sm" className="gradient-primary text-primary-foreground border-0">
              Начать
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 md:pt-36 md:pb-44">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gradient mb-4">
          Lurk Dev
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-10">
          AI‑генератор проектов. Опишите идею — получите код за секунды.
        </p>
        <Link to="/app">
          <Button size="lg" className="gradient-primary text-primary-foreground border-0 px-10 py-6 text-base font-semibold glow-shadow hover:opacity-90 transition-opacity">
            Open App
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12">Возможности</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="gradient-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-foreground font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Lurk Dev. Все права защищены.
      </footer>
    </div>
  );
};

export default Landing;
