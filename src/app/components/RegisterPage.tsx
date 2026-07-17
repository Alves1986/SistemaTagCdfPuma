import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle, ArrowLeft, Flame, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { GERENCIAS, getAreasByGerencia, getCargosByGerencia, getCoordenacoesByGerencia, getAreasByCoordenacao } from '../utils/hierarchy';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [gerencia, setGerencia] = useState(GERENCIAS.filter(g => g !== 'Manutenção')[0]);
  const [coordenacao, setCoordenacao] = useState('');
  const [areas, setAreas] = useState<string[]>([getAreasByGerencia(GERENCIAS.filter(g => g !== 'Manutenção')[0])[0]]);
  const [cargo, setCargo] = useState(getCargosByGerencia(GERENCIAS.filter(g => g !== 'Manutenção')[0])[0]);
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

    if (!nome || !prn || !cargo || !email || !senha || !confirmarSenha || areas.length === 0) {
      setError('Por favor, preencha todos os campos e selecione pelo menos uma área');
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
    const result = await register({ nome, prn, cargo, gerencia, coordenacao, areas_coordenadas: areas, email: email.trim(), senha });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Erro ao criar conta. Tente novamente.');
    } else {
      setSuccess(true);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-sm text-white placeholder:text-white/60 outline-none transition-all focus:border-white focus:ring-4 focus:ring-white/20 focus:bg-white/20 shadow-inner";

  if (success) {
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
            </div>
            <p className="text-primary-foreground/50 text-[0.75rem]">
              © {new Date().getFullYear()} Klabin S/A — Uso interno
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 lg:justify-end lg:pr-12">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/30 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={32} className="text-accent" />
            </div>
            <h2 className="font-bold text-white text-[1.5rem] tracking-tight mb-3">Conta criada!</h2>
            <p className="text-[0.95rem] text-white/90 mb-2 font-medium">
              Um e-mail de confirmação foi enviado para:
            </p>
            <p className="text-sm font-bold text-white mb-6 p-3 bg-white/10 rounded-lg">{email}</p>
            <p className="text-xs text-white/80 mb-8 font-medium">
              Confirme seu e-mail antes de fazer o primeiro acesso. Verifique também a pasta de spam.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-[0.95rem] font-bold shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <ArrowLeft size={16} />
              Ir para o Login
            </button>
          </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Crie sua conta para acessar a gestão de equipamentos e notas de manutenção.
            </p>
          </div>
          <p className="text-primary-foreground/50 text-[0.75rem]">
            © {new Date().getFullYear()} Klabin S/A — Uso interno
          </p>
        </div>

        {/* Right panel – form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:justify-end lg:pr-12">
          <div className="w-full max-w-md max-h-screen overflow-y-auto py-6">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <img src="/logo.svg" alt="Klabin Logo" className="h-10 w-auto object-contain brightness-0 invert" />
              <div className="flex-1">
                <p className="font-semibold text-xs uppercase tracking-widest text-primary-foreground mb-1">Klabin S/A</p>
                <p className="text-xs text-primary-foreground/80">Sistema TAG</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/30">
          <h2 className="mb-1 text-white font-bold text-[1.5rem] tracking-tight">Criar conta</h2>
          <p className="mb-8 text-sm text-white/90 font-medium">
            Preencha os dados para registrar seu acesso
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-wider text-white/70 pt-2 mb-2">
              Identificação
            </p>

            <div>
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
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
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
                PRN (Número de Registro Pessoal) *
              </label>
              <input
                type="text"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-white/70 font-medium">Mínimo 4 caracteres</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
                Gerência *
              </label>
              <select
                value={gerencia}
                onChange={(e) => {
                  const newGerencia = e.target.value;
                  setGerencia(newGerencia);
                  setCoordenacao('');
                  const firstArea = getAreasByGerencia(newGerencia)[0];
                  setAreas(firstArea ? [firstArea] : []);
                  setCargo(getCargosByGerencia(newGerencia)[0]);
                }}
                className={inputClass}
              >
                {GERENCIAS.filter(g => g !== 'Manutenção').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {getCoordenacoesByGerencia(gerencia) && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
                  Coordenação *
                </label>
                <select
                  value={coordenacao}
                  onChange={(e) => {
                    const newCoordenacao = e.target.value;
                    setCoordenacao(newCoordenacao);
                    const firstArea = getAreasByCoordenacao(gerencia, newCoordenacao)[0];
                    setAreas(firstArea ? [firstArea] : []);
                  }}
                  className={inputClass}
                >
                  <option value="" disabled>Selecione uma coordenação</option>
                  {Object.keys(getCoordenacoesByGerencia(gerencia)!).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
                Áreas de Trabalho * <span className="text-xs text-white/70 font-medium ml-1">(selecione todas)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded border border-white/20 bg-white/5">
                {(coordenacao ? getAreasByCoordenacao(gerencia, coordenacao) : getAreasByGerencia(gerencia)).map(a => (
                  <label key={a} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${
                    areas.includes(a)
                      ? 'bg-primary/20 text-white border border-primary/50 font-medium'
                      : 'hover:bg-white/10 text-white/90 border border-transparent'
                  }`}>
                    <input
                      type="checkbox"
                      checked={areas.includes(a)}
                      onChange={() => {
                        setAreas(prev =>
                          prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                        );
                      }}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    {a}
                  </label>
                ))}
              </div>
              {areas.length === 0 && (
                <p className="mt-1.5 text-xs text-destructive">Selecione pelo menos uma área</p>
              )}
            </div>


            <div>
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
                Função / Cargo *
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className={inputClass}
              >
                {getCargosByGerencia(gerencia).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>


            <p className="text-xs font-bold uppercase tracking-wider text-white/70 pt-4 mb-2">
              Credenciais de acesso
            </p>

            <div>
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
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
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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
              <label className="block mb-2 text-sm font-semibold text-white drop-shadow-md">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasIguais && (
                <p className="mt-1 text-xs text-destructive">As senhas não conferem</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-[0.95rem] font-bold shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus size={18} />
                )}
                {submitting ? 'Criando conta…' : 'Criar Conta'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-white/40 text-white text-[0.95rem] font-bold transition-all bg-white/10 hover:bg-white/20 hover:scale-[1.02] shadow-lg"
            >
              <ArrowLeft size={16} />
              Voltar para Login
            </button>
          </div>

          <div className="mt-4 p-3 rounded text-xs space-y-1 bg-white/5 border border-white/10 text-white/80">
            <p className="font-medium text-white">📋 Informações importantes</p>
            <p>• Seu e-mail será usado para acessar o sistema</p>
            <p>• O PRN identifica você nas notas e comentários</p>
            <p>• Um e-mail de confirmação será enviado após o cadastro</p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
