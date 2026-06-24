import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-800 text-surface-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              MãoCerta
            </div>
            <p className="text-sm leading-relaxed text-surface-300 max-w-xs">
              Conectamos você aos melhores prestadores de serviço da sua cidade. Rápido, seguro e confiável.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Serviços</h4>
            <ul className="space-y-2 text-sm">
              {['Pintor', 'Eletricista', 'Encanador', 'Montador de Móveis'].map((s) => (
                <li key={s}>
                  <Link to="/buscar" className="hover:text-white transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cadastro/prestador" className="hover:text-white transition-colors">Seja um prestador</Link></li>
              <li><Link to="/cadastro/cliente" className="hover:text-white transition-colors">Criar conta</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Entrar</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-700 mt-10 pt-6 text-xs text-surface-600 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} MãoCerta. Todos os direitos reservados.</p>
          <p>Feito com dedicação para o Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}
