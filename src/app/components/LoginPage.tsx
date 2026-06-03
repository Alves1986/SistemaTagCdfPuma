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

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#F4F5F7' }}
    >
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{ backgroundColor: '#003865' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded"
            style={{ backgroundColor: '#00A551' }}
          >
            <Flame size={22} className="text-white" />
          </div>
          <span
            className="text-white font-semibold tracking-widest uppercase text-sm"
          >
            KLABIN S/A
          </span>
        </div>

        <div>
          <h1
            className="text-white mb-4"
            style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}
          >
            Sistema TAG<br />Caldeira de Força
          </h1>
          <p style={{ color: '#7ab3d4', lineHeight: 1.7, fontSize: '0.9rem' }}>
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
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#00A551' }}
                />
                <span style={{ color: '#a8c8e0', fontSize: '0.85rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#4a7fa0', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Klabin S/A — Uso interno
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 flex items-center justify-center rounded"
              style={{ backgroundColor: '#003865' }}
            >
              <Flame size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#003865' }}>KLABIN S/A</p>
              <p className="text-xs" style={{ color: '#5A5A5A' }}>Sistema TAG – Caldeira de Força</p>
            </div>
          </div>

          <div
            className="bg-white rounded p-8 shadow-sm border"
            style={{ borderColor: '#D1D5DB' }}
          >
            <h2
              className="mb-1"
              style={{ color: '#2D2D2D', fontWeight: 600, fontSize: '1.3rem' }}
            >
              Acesso ao sistema
            </h2>
            <p className="mb-6 text-sm" style={{ color: '#5A5A5A' }}>
              Informe suas credenciais para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded border text-sm"
                  style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="nome"
                  className="block mb-1.5 text-sm font-medium"
                  style={{ color: '#2D2D2D' }}
                >
                  Nome do Operador
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#2D2D2D',
                    backgroundColor: '#F9FAFB',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label
                  htmlFor="prn"
                  className="block mb-1.5 text-sm font-medium"
                  style={{ color: '#2D2D2D' }}
                >
                  PRN
                </label>
                <input
                  id="prn"
                  type="password"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  placeholder="Número de registro pessoal"
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#2D2D2D',
                    backgroundColor: '#F9FAFB',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#003865'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: '#003865' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#002850'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
              >
                <LogIn size={16} />
                Entrar
              </button>
            </form>

            <div
              className="mt-5 pt-5 border-t"
              style={{ borderColor: '#E8E8E8' }}
            >
              <p className="text-sm mb-3" style={{ color: '#5A5A5A' }}>
                Ainda não tem cadastro?
              </p>
              <button
                onClick={() => setShowRegister(true)}
                className="w-full py-2.5 rounded border text-sm font-medium transition-colors"
                style={{ borderColor: '#00A551', color: '#00A551', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00A551'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#00A551'; }}
              >
                Criar Nova Conta
              </button>
            </div>

            <div
              className="mt-4 p-3 rounded text-xs space-y-1"
              style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}
            >
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
