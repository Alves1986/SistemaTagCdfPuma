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
        
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/30 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle size={32} className="text-accent" />
              </div>
              <h2 className="font-bold text-white text-[1.5rem] tracking-tight mb-3">Conta criada!</h2>
              <p className="text-[0.95rem] text-white/90 mb-2 font-medium">
                Um e-mail de confirmação foi enviado para:
              </p>
              <p className="text-sm font-bold text-white mb-6 p-3 bg-white/10 rounded-xl shadow-inner">{email}</p>
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
      
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-4xl py-6">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/30">
            
            {/* Header com Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-white/20 gap-4">
              <div>
                <h2 className="text-white font-bold text-[1.8rem] tracking-tight mb-1">Criar conta</h2>
                <p className="text-[0.95rem] text-white/90 font-medium">
                  Preencha os dados para registrar seu acesso
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                <img src="/logo.svg" alt="Klabin Logo" className="h-8 w-auto object-contain" />
                <div className="hidden sm:block">
                  <p className="font-semibold text-[10px] uppercase tracking-widest text-white mb-0.5 leading-none">Klabin S/A</p>
                  <p className="text-[10px] text-white/80 leading-none">Sistema TAG</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-2 p-3 mb-6 rounded-xl border border-destructive/30 bg-destructive/20 text-white text-sm shadow-sm backdrop-blur-md">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <p className="font-medium text-red-100">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* COLUNA ESQUERDA: Identificação */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 border-b border-white/10 pb-2">
                    Identificação
                  </p>

                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
                      PRN (Número de Registro Pessoal) *
                    </label>
                    <input
                      type="text"
                      value={prn}
                      onChange={(e) => setPrn(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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
                      <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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
                </div>

                {/* COLUNA DIREITA: Credenciais e Áreas */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 border-b border-white/10 pb-2">
                    Credenciais e Áreas
                  </p>

                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
                        Senha *
                      </label>
                      <div className="relative">
                        <input
                          type={showSenha ? 'text' : 'password'}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="Mín. 8 char"
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
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
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
                            confirmarSenha.length > 0 && !senhasIguais ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
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
                    </div>
                  </div>
                  
                  {senha.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${senhaForte ? 'bg-accent' : 'bg-amber-400'}`} />
                      <span className={`text-xs font-medium ${senhaForte ? 'text-accent' : 'text-amber-400'}`}>
                        {senhaForte ? 'Senha forte' : 'Mínimo 8 caracteres'}
                      </span>
                    </div>
                  )}
                  {confirmarSenha.length > 0 && !senhasIguais && (
                    <p className="mt-1 text-xs font-medium text-red-300">As senhas não conferem</p>
                  )}

                  <div className="pt-2">
                    <label className="block mb-1.5 text-sm font-semibold text-white drop-shadow-md">
                      Áreas de Trabalho * <span className="text-xs text-white/70 font-medium ml-1">(selecione todas)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-white/20 bg-white/5 max-h-[140px] overflow-y-auto">
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
                      <p className="mt-1.5 text-xs font-medium text-red-300">Selecione pelo menos uma área</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Botões e Footer */}
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-col md:flex-row gap-4 items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-2/3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-[0.95rem] font-bold shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  {submitting ? 'Criando conta…' : 'Criar Conta'}
                </button>
                
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full md:w-1/3 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-white/40 text-white text-[0.95rem] font-bold transition-all bg-white/10 hover:bg-white/20 hover:scale-[1.02] shadow-lg"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center text-xs bg-white/5 border border-white/10 text-white/80 p-4 rounded-xl shadow-inner">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span>📋</span>
                  Informações importantes:
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
                  <p>• O PRN identifica você nas notas</p>
                  <p>• E-mail é seu acesso</p>
                  <p>• Confirmação via e-mail</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
