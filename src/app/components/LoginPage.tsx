import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import { RegisterPage } from './RegisterPage';

export function LoginPage() {
  const [nome, setNome] = useState('');
  const [prn, setPrn] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !prn) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const success = login(nome, prn);
    if (!success) {
      setError('Nome ou PRN inválidos');
    }
  };

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚙️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema TAG</h1>
          <p className="text-gray-600">Caldeira de Força</p>
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
              Nome do Operador
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="prn" className="block text-sm font-medium text-gray-700 mb-2">
              PRN
            </label>
            <input
              id="prn"
              type="password"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              placeholder="Digite seu PRN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <LogIn size={20} />
            Entrar
          </button>
        </form>

        {/* Link para Cadastro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Ainda não tem cadastro?</p>
          <button
            onClick={() => setShowRegister(true)}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Informações */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">ℹ️ Informações:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use seu nome completo para login</li>
            <li>• O PRN é seu número de registro pessoal</li>
            <li>• Se ainda não tem cadastro, clique em "Criar Nova Conta"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}