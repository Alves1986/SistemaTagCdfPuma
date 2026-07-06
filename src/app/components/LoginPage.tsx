import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle, Flame } from 'lucide-react';
import { RegisterPage } from './RegisterPage';

export function LoginPage() {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !prn) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const success = await login(nome, prn);
    if (!success) {
      setError('Nome ou PRN inválidos');
    }
  };

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 bg-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded bg-accent">
            <Flame size={22} className="text-accent-foreground" />
          </div>
          <span className="text-primary-foreground font-semibold tracking-widest uppercase text-sm">
            KLABIN S/A
          </span>
        </div>

        <div>
          <h1 className="text-primary-foreground mb-4 text-[2.25rem] font-bold leading-tight tracking-tight">
            Sistema TAG<br />Caldeira de Força
          </h1>
          <p className="text-primary-foreground/80 leading-relaxed text-[0.9rem]">
            Gestão de equipamentos, notas de manutenção e histórico de operações em tempo real.
          </p>

          <div className="mt-12 space-y-4">
            {[
              'Busca por TAG ou equipamento',
              'Notas de manutenção com prioridade',
              'Histórico de fotos e comentários',
              'Controle de acesso por cargo',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-accent" />
                <span className="text-primary-foreground/70 text-[0.85rem]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/50 text-[0.75rem]">
          © {new Date().getFullYear()} Klabin S/A — Uso interno
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 flex items-center justify-center rounded bg-primary">
              <Flame size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm text-primary">KLABIN S/A</p>
              <p className="text-xs text-muted-foreground">Sistema TAG – Caldeira de Força</p>
            </div>
          </div>

          <div className="bg-card rounded p-8 shadow-sm border border-border">
            <h2 className="mb-1 text-foreground font-semibold text-[1.3rem]">
              Acesso ao sistema
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Informe suas credenciais para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="nome"
                  className="block mb-1.5 text-sm font-medium text-foreground"
                >
                  Nome do Operador
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="prn"
                  className="block mb-1.5 text-sm font-medium text-foreground"
                >
                  PRN
                </label>
                <input
                  id="prn"
                  type="password"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  placeholder="Número de registro pessoal"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
              >
                <LogIn size={16} />
                Entrar
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-sm mb-3 text-muted-foreground">
                Ainda não tem cadastro?
              </p>
              <button
                onClick={() => setShowRegister(true)}
                className="w-full py-2.5 rounded border border-accent text-accent text-sm font-medium transition-colors bg-transparent hover:bg-accent hover:text-accent-foreground"
              >
                Criar Nova Conta
              </button>
            </div>

            <div className="mt-4 p-3 rounded text-xs space-y-1 bg-primary/5 text-primary/80">
              <p className="font-medium">ℹ️ Informações</p>
              <p>• Use seu nome completo para login</p>
              <p>• O PRN é seu número de registro pessoal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
