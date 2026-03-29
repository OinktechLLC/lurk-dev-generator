import { Link } from "react-router-dom";
import { Zap, Shield, Clock, Sparkles, Code, Layers, Rocket, FileCode2, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import auroraBg from "@/assets/aurora-bg.jpg";

const features = [
  { icon: Sparkles, title: "Генерация под задачу", desc: "Описываете идею на русском — получаете готовые файлы проекта." },
  { icon: FileCode2, title: "Реальные файлы", desc: "ИИ возвращает структуру проекта, а не просто общий текст." },
  { icon: Code, title: "Frontend + Backend", desc: "Лендинги, SPA, API и шаблоны под быстрый запуск." },
  { icon: Zap, title: "Запуск за минуты", desc: "Скачайте ZIP и запустите проект локально после генерации." },
  { icon: Clock, title: "История версий", desc: "Все генерации сохраняются внутри проекта и доступны позже." },
  { icon: Layers, title: "Итеративный режим", desc: "Дорабатывайте текущий проект новыми промптами через чат." },
];

const stats = [
  { label: "Бесплатные кредиты", value: "5 / день" },
  { label: "Среднее время", value: "~20 сек" },
  { label: "Поддержка стеков", value: "React, Vue, Node" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <img src={auroraBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" width={1920} height={1080} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.25),transparent_40%)] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xl font-black tracking-tight">
          <Stars className="w-5 h-5 text-primary" />
          <span className="text-foreground">Lurk Dev</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Войти</Button>
          </Link>
          <Link to="/auth?tab=register">
            <Button size="sm" className="gradient-primary text-primary-foreground border-0">Начать бесплатно</Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary mb-5">
              <Rocket className="w-3.5 h-3.5" />
              AI Website Generator
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-foreground mb-5">
              Генерируйте сайты как на
              <span className="text-gradient"> lork.dev</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8">
              Lurk Dev создаёт полноценные файлы проекта: структуру, компоненты, стили и готовый ZIP для запуска.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link to="/app">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 px-8">Открыть приложение</Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-border/80">Как это работает</Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/70 bg-card/60 backdrop-blur p-4">
                  <div className="text-xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="gradient-card border border-border rounded-2xl p-5 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Пример запроса</p>
              <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-1">Live prompt</span>
            </div>
            <div className="rounded-xl bg-background/70 border border-border p-4 text-sm text-foreground whitespace-pre-wrap">
              Создай лендинг студии дизайна в тёмной теме: hero, портфолио, отзывы, CTA и форму заявки.
            </div>
            <div className="mt-4 rounded-xl bg-background/70 border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Результат</p>
              <ul className="space-y-1 text-xs font-mono text-foreground/90">
                <li>src/main.tsx</li>
                <li>src/App.tsx</li>
                <li>src/components/Hero.tsx</li>
                <li>src/components/Portfolio.tsx</li>
                <li>src/styles.css</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">Почему Lurk Dev</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="gradient-card rounded-xl border border-border p-6 hover:border-primary/40 transition-colors">
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-foreground font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Запустите первый проект за 1 минуту</h3>
          <p className="text-muted-foreground mb-6">Зарегистрируйтесь, введите идею и скачайте готовый сайт в ZIP.</p>
          <Link to="/auth?tab=register">
            <Button size="lg" className="gradient-primary text-primary-foreground border-0 px-8">Начать сейчас</Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>© 2026 TOO Oink Tech Ltd Co. Все права защищены.</span>
        <div className="flex items-center gap-5">
          <Link to="/about" className="hover:text-foreground transition-colors">FAQ</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Войти</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
