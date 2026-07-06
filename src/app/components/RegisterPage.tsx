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

  const inputClass = "w-full px-3 py-2.5 rounded border border-border bg-muted/30 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
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
            Criar conta
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Preencha os dados para registrar seu acesso
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-sm font-medium text-foreground">
                Nome Completo *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
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
                Cargo *
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className={inputClass}
              >
                <option value="Operador Lider">Operador Lider</option>
                <option value="Operador III">Operador III</option>
                <option value="Operador II">Operador II</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
            >
              <UserPlus size={16} />
              Criar Conta
            </button>
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
            <p>• Seu PRN será usado para acessar o sistema</p>
            <p>• Todas as alterações serão registradas com seu nome</p>
          </div>
        </div>
      </div>
    </div>
  );
}
