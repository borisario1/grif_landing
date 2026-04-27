import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-glow not-found-glow-left" aria-hidden="true" />
      <div className="not-found-glow not-found-glow-right" aria-hidden="true" />
      <section className="container not-found-wrap">
        <p className="not-found-code">404</p>
        <h1>Страница не найдена</h1>
        <p className="not-found-lead">
          Похоже, ссылка устарела или была введена с ошибкой. Вернитесь на главную или перейдите сразу в каталог
          акционных моделей PAINI.
        </p>
        <div className="not-found-actions">
          <Link href="/#catalog" className="btn btn-primary">
            <Search size={16} aria-hidden="true" />
            Перейти в каталог
          </Link>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
