import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const hostingTargets = [
  { name: "Onreza", url: "https://onreza.ru", kind: "Frontend / Backend" },
  { name: "Vercel", url: "https://vercel.com", kind: "Frontend / Fullstack" },
  { name: "Relaxdev", url: "https://relaxdev.ru", kind: "Frontend / Backend" },
  { name: "Tatnet", url: "https://tatnet.ru", kind: "Frontend / Backend" },
  { name: "Twix Site Hosting", url: "https://twix-sitehosting.lovable.app/ru/", kind: "Static HTML" },
];

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-foreground font-semibold">Документация и правила</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <section className="gradient-card border border-border rounded-xl p-6 md:p-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Политики Lurk Dev</h1>
          <p className="text-sm text-muted-foreground">
            Ниже собраны основные правила использования платформы. Они написаны простым языком, чтобы любой пользователь
            понимал: что можно делать, какие есть ограничения, и как безопасно публиковать сгенерированный код.
          </p>
        </section>

        <section className="gradient-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground">1) Условия использования</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Lurk Dev — это AI-платформа для генерации исходного кода, структуры проекта и шаблонов файлов.</li>
            <li>Вы несёте ответственность за проверку результата перед продакшен-развёртыванием.</li>
            <li>Запрещено использовать сервис для вредоносного ПО, фишинга, взлома и обхода безопасности.</li>
            <li>При нарушениях доступ может быть ограничен или заблокирован.</li>
          </ul>
        </section>

        <section className="gradient-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground">2) Политика конфиденциальности</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Мы храним данные аккаунта, проекты, промпты и результаты генераций для работы сервиса.</li>
            <li>Не добавляйте в промпты пароли, ключи API и другую критичную секретную информацию.</li>
            <li>Данные используются для исполнения функций платформы: генерация, экспорт, история проектов.</li>
            <li>Пользователь может удалить проект — связанные генерации перестанут отображаться в интерфейсе.</li>
          </ul>
        </section>

        <section className="gradient-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground">3) Политика по AI-коду и правам использования</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Сгенерированный ИИ код можно копировать, редактировать, скачивать и использовать в ваших проектах.</li>
            <li>Перед публикацией обязательно проведите аудит безопасности и лицензий внешних зависимостей.</li>
            <li>Код предоставляется «как есть»: без гарантий полной корректности, отсутствия багов и уязвимостей.</li>
            <li>Для коммерческих проектов рекомендуется юридическая и техническая проверка перед релизом.</li>
          </ul>
        </section>

        <section className="gradient-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">4) Пошаговый туториал по деплою</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Шаг 1.</strong> Сгенерируйте проект и откройте нужный ответ ИИ.</p>
            <p><strong className="text-foreground">Шаг 2.</strong> Нажмите «Копировать код» (в буфер) или «Скачать код» (архив).</p>
            <p><strong className="text-foreground">Шаг 3.</strong> Подготовьте проект локально: установите зависимости, проверьте `.env` и команды запуска.</p>
            <p><strong className="text-foreground">Шаг 4.</strong> Выберите тип проекта и площадку:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Frontend / Fullstack (React, Next, API): Vercel, Onreza, Relaxdev, Tatnet.</li>
              <li>Статический HTML/CSS/JS: Twix Site Hosting.</li>
            </ul>
            <p><strong className="text-foreground">Шаг 5.</strong> Загрузите репозиторий или архив в выбранный хостинг и выполните деплой.</p>
            <p><strong className="text-foreground">Шаг 6.</strong> После деплоя проверьте домен, SSL, формы и логи ошибок.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {hostingTargets.map((target) => (
              <a
                key={target.name}
                href={target.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-background/60 p-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{target.name}</p>
                    <p className="text-xs text-muted-foreground">{target.kind}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="text-sm text-muted-foreground border-t border-border pt-6">
          <p>
            Если нужна помощь с деплоем или разбором кода, напишите в поддержку:{" "}
            <a href="mailto:support@oinktech.com" className="text-primary hover:underline">support@oinktech.com</a>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Docs;
