import { useRouteError } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-slate-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="font-heading text-2xl text-white mb-4">Página não encontrada</h2>
        <p className="font-paragraph text-slate-400 mb-8">
          {error instanceof Error ? error.message : 'A página que você está procurando não existe.'}
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-primary text-white font-heading uppercase tracking-widest hover:bg-primary/90 transition-colors duration-300"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
