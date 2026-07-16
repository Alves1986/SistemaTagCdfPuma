import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle, ArrowLeft, Flame, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [cargo, setCargo] = useState('Operador II');
  const [gerencia, setGerencia] = useState('Utilidades');
  const [area, setArea] = useState('CDF2 / ETAC2');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const senhaForte = senha.length >= 8;
  const senhasIguais = senha === confirmarSenha && confirmarSenha.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !prn || !cargo || !email || !senha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    if (prn.length < 4) {
      setError('O PRN deve ter pelo menos 4 caracteres');
      return;
    }
    if (!senhaForte) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não conferem');
      return;
    }

    setSubmitting(true);
    const result = await register({ nome, prn, cargo, gerencia, area, email: email.trim(), senha });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Erro ao criar conta. Tente novamente.');
    } else {
      setSuccess(true);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card rounded p-8 shadow-sm border border-border text-center">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-accent" />
            </div>
            <h2 className="font-semibold text-foreground text-[1.3rem] mb-2">Conta criada!</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Um e-mail de confirmação foi enviado para:
            </p>
            <p className="text-sm font-medium text-foreground mb-5">{email}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Confirme seu e-mail antes de fazer o primeiro acesso. Verifique também a pasta de spam.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
            >
              <ArrowLeft size={16} />
              Ir para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.svg" alt="Klabin Logo" className="h-9 w-auto object-contain" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-primary">KLABIN S/A</p>
            <p className="text-xs text-muted-foreground">Sistema TAG</p>
          </div>
        </div>

        <div className="bg-card rounded p-8 shadow-sm border border-border">
          <h2 className="mb-1 text-foreground font-semibold text-[1.3rem]">Criar conta</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Preencha os dados para registrar seu acesso
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">
              Identificação
            </p>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                Nome Completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                PRN (Número de Registro Pessoal) *
              </label>
              <input
                type="text"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">Mínimo 4 caracteres</p>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                Função / Cargo *
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className={inputClass}
              >
                <option value="Aprendiz">Aprendiz</option>
                <option value="Operador II">Operador II</option>
                <option value="Operador III">Operador III</option>
                <option value="Operador Lider">Operador Líder</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Especialista">Especialista</option>
                <option value="Engenheiro">Engenheiro(a)</option>
                <option value="Assistente Tecnico">Assistente Técnico</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">
                  Gerência *
                </label>
                <select
                  value={gerencia}
                  onChange={(e) => setGerencia(e.target.value)}
                  className={inputClass}
                >
                  <option value="Utilidades">Utilidades</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Operação">Operação</option>
                  <option value="Projetos">Projetos</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">
                  Área *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={inputClass}
                >
                  <option value="CDF2 / ETAC2">CDF2 / ETAC2</option>
                  <option value="CDF1 / ETAC1">CDF1 / ETAC1</option>
                  <option value="Tratamento de Efluentes">Tratamento de Efluentes</option>
                </select>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              Credenciais de acesso
            </p>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@klabin.com.br"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {senha.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${senhaForte ? 'bg-accent' : 'bg-amber-400'}`} />
                  <span className={`text-xs ${senhaForte ? 'text-accent' : 'text-amber-600'}`}>
                    {senhaForte ? 'Senha forte' : 'Mín. 8 caracteres'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                Confirmar senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10 ${
                    confirmarSenha.length > 0 && !senhasIguais ? 'border-destructive' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasIguais && (
                <p className="mt-1 text-xs text-destructive">As senhas não conferem</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                {submitting ? 'Criando conta…' : 'Criar Conta'}
              </button>
            </div>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded border border-border text-muted-foreground text-sm font-medium transition-colors bg-transparent hover:bg-muted"
            >
              <ArrowLeft size={16} />
              Voltar para Login
            </button>
          </div>

          <div className="mt-4 p-3 rounded text-xs space-y-1 bg-primary/5 text-primary/80">
            <p className="font-medium">📋 Informações importantes</p>
            <p>• Seu e-mail será usado para acessar o sistema</p>
            <p>• O PRN identifica você nas notas e comentários</p>
            <p>• Um e-mail de confirmação será enviado após o cadastro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
