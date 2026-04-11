import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [cargo, setCargo] = useState('Operador Lider');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
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

    const success = register(nome, prn, cargo);
    if (!success) {
      setError('Já existe um usuário cadastrado com este nome');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚙️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro</h1>
          <p className="text-gray-600">Sistema TAG - Caldeira de Força</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="prn" className="block text-sm font-medium text-gray-700 mb-2">
              PRN (Número de Registro Pessoal) *
            </label>
            <input
              id="prn"
              type="text"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              placeholder="Digite seu PRN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo 4 caracteres</p>
          </div>

          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <select
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Operador Lider">Operador Lider</option>
              <option value="Operador III">Operador III</option>
              <option value="Operador II">Operador II</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <UserPlus size={20} />
            Criar Conta
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-6">
          <button
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para Login
          </button>
        </div>

        {/* Informações */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>📋 Informações importantes:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Seu PRN será usado para acessar o sistema</li>
            <li>• Guarde seu PRN em local seguro</li>
            <li>• Todas as alterações serão registradas com seu nome</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
