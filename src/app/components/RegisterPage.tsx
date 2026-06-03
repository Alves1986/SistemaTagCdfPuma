import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle, ArrowLeft, Flame } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [cargo, setCargo] = useState('Operador Lider');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !prn || !cargo) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (prn.length < 4) {
      setError('O PRN deve ter pelo menos 4 caracteres');
      return;
    }

    const success = await register(nome, prn, cargo);
    if (!success) {
      setError('Já existe um usuário cadastrado com este nome');
    }
  };

  const inputStyle = {
    borderColor: '#D1D5DB',
    color: '#2D2D2D',
    backgroundColor: '#F9FAFB',
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#003865';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,56,101,0.1)';
  };

  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#D1D5DB';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F4F5F7' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
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
            Criar conta
          </h2>
          <p className="mb-6 text-sm" style={{ color: '#5A5A5A' }}>
            Preencha os dados para registrar seu acesso
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
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                Nome Completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                PRN (Número de Registro Pessoal) *
              </label>
              <input
                type="text"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <p className="mt-1 text-xs" style={{ color: '#5A5A5A' }}>Mínimo 4 caracteres</p>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                Cargo *
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="Operador Lider">Operador Lider</option>
                <option value="Operador III">Operador III</option>
                <option value="Operador II">Operador II</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: '#003865' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#002850'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003865'; }}
            >
              <UserPlus size={16} />
              Criar Conta
            </button>
          </form>

          <div className="mt-5 pt-5 border-t" style={{ borderColor: '#E8E8E8' }}>
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded border text-sm transition-colors"
              style={{ borderColor: '#D1D5DB', color: '#5A5A5A', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={16} />
              Voltar para Login
            </button>
          </div>

          <div
            className="mt-4 p-3 rounded text-xs space-y-1"
            style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}
          >
            <p className="font-medium">📋 Informações importantes</p>
            <p>• Seu PRN será usado para acessar o sistema</p>
            <p>• Todas as alterações serão registradas com seu nome</p>
          </div>
        </div>
      </div>
    </div>
  );
}
