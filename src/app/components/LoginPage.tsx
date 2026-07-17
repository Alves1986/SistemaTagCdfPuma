import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle, Flame, Eye, EyeOff } from 'lucide-react';
import { RegisterPage } from './RegisterPage';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), senha);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Erro ao fazer login. Tente novamente.');
    }
  };

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden"
      style={{ 
        backgroundImage: 'url(/capa.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/70 to-transparent" />
      
      <div className="relative z-10 w-full flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Left panel – branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 lg:w-3/5 p-12 py-16">
          <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Klabin Logo" className="h-10 w-auto object-contain" />
          <span className="text-primary-foreground font-semibold tracking-widest uppercase text-sm">
            KLABIN S/A
          </span>
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-primary-foreground">
            Sistema TAG
          </h1>
          <p className="text-primary-foreground/80 leading-relaxed text-[0.9rem]">
            Gestão de equipamentos, notas de manutenção e histórico de operações em tempo real.
          </p>

          <div className="mt-12 space-y-4">
            {[
              'Busca por TAG ou equipamento',
              'Notas de manutenção com prioridade',
              'Histórico de fotos e comentários',
              'Autenticação segura via Supabase',
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
        <div className="flex-1 flex items-center justify-center p-6 lg:justify-end lg:pr-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.svg" alt="Klabin Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground mb-1">Klabin S/A</p>
              <p className="text-xs text-primary-foreground/80">Sistema TAG</p>
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur-md rounded-lg p-8 shadow-2xl border border-white/20">
            <h2 className="mb-1 text-foreground font-semibold text-[1.3rem]">
              Acesso ao sistema
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Informe seu e-mail e senha para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-foreground">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@klabin.com.br"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="senha" className="block mb-1.5 text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                {submitting ? 'Entrando…' : 'Entrar'}
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
          </div>
        </div>
      </div>
    </div>
  );
}
