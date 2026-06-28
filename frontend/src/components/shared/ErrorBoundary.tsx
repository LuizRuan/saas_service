import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Algo deu errado</h2>
            <p className="text-sm text-white/40 max-w-sm">
              Ocorreu um erro inesperado ao carregar esta página.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
