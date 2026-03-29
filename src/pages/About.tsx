import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    q: "Что такое Lurk Dev?",
    a: "Lurk Dev — это AI-платформа для генерации проектов. Опишите свою идею в чате, и наш ИИ создаст для вас готовый код.",
  },
  {
    q: "Сколько стоит использование?",
    a: "Каждый день вы получаете 5 бесплатных кредитов. Один кредит = одна генерация. Кредиты обновляются ежедневно в 00:00 по московскому времени.",
  },
  {
    q: "Какие технологии поддерживаются?",
    a: "Lurk Dev поддерживает React, Vue, Node.js, Python и многие другие стеки. Укажите нужный стек при создании проекта.",
  },
  {
    q: "Можно ли экспортировать код?",
    a: "Да! На странице проекта нажмите кнопку «Экспорт ZIP», чтобы скачать все сгенерированные файлы в архиве.",
  },
  {
    q: "Как связаться с поддержкой?",
    a: "Напишите нам на support@oinktech.com — мы ответим в течение 24 часов.",
  },
  {
    q: "Кто стоит за Lurk Dev?",
    a: "Lurk Dev разработан и поддерживается компанией TOO Oink Tech Ltd Co. Мы создаём инструменты для разработчиков, которые экономят время и повышают продуктивность.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-foreground font-semibold">О проекте</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* About section */}
        <section className="mb-16">
          <h1 className="text-3xl md:text-4xl font-black text-gradient mb-6">Lurk Dev</h1>
          <div className="gradient-card border border-border rounded-xl p-6 md:p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Lurk Dev</strong> — AI‑генератор проектов нового поколения.
              Мы верим, что создание программного обеспечения должно быть доступным, быстрым и интуитивным.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Проект разработан и поддерживается компанией{" "}
              <strong className="text-foreground">TOO Oink Tech Ltd Co</strong>. Наша команда создаёт
              современные инструменты для разработчиков, сочетая искусственный интеллект с лучшими
              практиками индустрии.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Часто задаваемые вопросы</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="gradient-card border border-border rounded-xl px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-foreground text-sm font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Company footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 TOO Oink Tech Ltd Co. Все права защищены.</p>
        </div>
      </main>
    </div>
  );
};

export default About;
