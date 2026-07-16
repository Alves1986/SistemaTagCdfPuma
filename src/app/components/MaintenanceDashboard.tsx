import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Tool, Eye, Settings, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { Tag } from '../types';
import * as api from '../services/api';

type Especialidade = 'Mecânica' | 'Elétrica' | 'Instrumentação' | 'Automação';

export function MaintenanceDashboard() {
  const { user } = useAuth();
  const { selectedArea } = useArea();
  const navigate = useNavigate();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Especialidade>('Mecânica');

  useEffect(() => {
    // Acesso restrito
    if (user?.cargo !== 'Gestor de Manutenção') {
      navigate('/admin');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allTags = await api.getAllTags();
      
      // Filtra por área (se preenchida) e se tem nota
      const filtered = allTags.filter(tag => {
        const matchesArea = !selectedArea || tag.localizacao_texto?.includes(selectedArea);
        return matchesArea && tag.nota_manutencao;
      });
      
      setTags(filtered);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tagId: number, novoStatus: 'aberta' | 'visualizada' | 'em_tratamento' | 'finalizada_manutencao') => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag || !tag.nota_manutencao) return;

    try {
      const updatedTag = await api.updateTag(tag.id, {
        nota_manutencao: {
          ...tag.nota_manutencao,
          status_manutencao: novoStatus
        }
      });
      
      setTags(tags.map(t => t.id === tagId ? updatedTag : t));
    } catch (error) {
      alert('Erro ao atualizar status da nota');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando painel de manutenção…</p>
      </div>
    );
  }

  // Agrupa e conta
  const tagsByTab = tags.filter(t => t.nota_manutencao?.especialidade === activeTab);
  
  const counts = {
    Mecânica: tags.filter(t => t.nota_manutencao?.especialidade === 'Mecânica').length,
    Elétrica: tags.filter(t => t.nota_manutencao?.especialidade === 'Elétrica').length,
    Instrumentação: tags.filter(t => t.nota_manutencao?.especialidade === 'Instrumentação').length,
    Automação: tags.filter(t => t.nota_manutencao?.especialidade === 'Automação').length,
  };

  const tabs: { id: Especialidade; label: string; icon: any }[] = [
    { id: 'Mecânica', label: 'Mecânica', icon: Tool },
    { id: 'Elétrica', label: 'Elétrica', icon: Settings },
    { id: 'Instrumentação', label: 'Instrumentação', icon: Eye },
    { id: 'Automação', label: 'Automação', icon: Play },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Manutenção</h1>
            <p className="text-sm text-muted-foreground">Área atual: {selectedArea || 'Todas as Áreas'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/30 p-1.5 rounded-lg border border-border overflow-x-auto hide-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all min-w-[120px] ${
                isActive 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {tagsByTab.length === 0 ? (
          <div className="p-12 text-center bg-muted/10 border border-border rounded-lg border-dashed">
            <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium text-foreground">Tudo limpo!</h3>
            <p className="text-xs text-muted-foreground mt-1">Nenhuma nota aberta para a especialidade {activeTab}.</p>
          </div>
        ) : (
          tagsByTab.map(tag => {
            const nota = tag.nota_manutencao!;
            const status = nota.status_manutencao || 'aberta';
            
            return (
              <div key={tag.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{tag.tag_completo}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        nota.prioridade === 'urgente' ? 'bg-destructive text-destructive-foreground' :
                        nota.prioridade === 'alta' ? 'bg-orange-600 text-white' :
                        nota.prioridade === 'média' ? 'bg-amber-600 text-white' :
                        'bg-primary text-primary-foreground'
                      }`}>
                        {nota.prioridade}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        status === 'aberta' ? 'bg-red-100 text-red-800' :
                        status === 'visualizada' ? 'bg-blue-100 text-blue-800' :
                        status === 'em_tratamento' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium text-foreground">Equipamento:</span> {tag.nome_equipamento}</p>
                      <p><span className="font-medium text-foreground">Nota:</span> {nota.numero_nota}</p>
                      <p><span className="font-medium text-foreground">Descrição:</span> {nota.descricao}</p>
                      <p className="text-xs mt-2 text-muted-foreground/80">Aberta por {nota.aberta_por} em {new Date(nota.data_abertura).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-col gap-2">
                    {status === 'aberta' && (
                      <button 
                        onClick={() => handleUpdateStatus(tag.id, 'visualizada')}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors text-center"
                      >
                        Marcar Visualizado
                      </button>
                    )}
                    
                    {(status === 'aberta' || status === 'visualizada') && (
                      <button 
                        onClick={() => handleUpdateStatus(tag.id, 'em_tratamento')}
                        className="flex-1 md:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition-colors text-center"
                      >
                        Iniciar Tratamento
                      </button>
                    )}
                    
                    {(status === 'em_tratamento' || status === 'visualizada') && (
                      <button 
                        onClick={() => handleUpdateStatus(tag.id, 'finalizada_manutencao')}
                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors text-center"
                      >
                        Sinalizar Finalizado
                      </button>
                    )}

                    {status === 'finalizada_manutencao' && (
                      <div className="px-4 py-2 bg-muted text-muted-foreground text-xs font-medium rounded border border-border text-center">
                        Aguardando Validação da Operação
                      </div>
                    )}
                    
                    <Link 
                      to={`/tag/${tag.id}`}
                      className="flex-1 md:flex-none px-4 py-2 bg-transparent hover:bg-muted text-foreground text-xs font-medium rounded border border-border transition-colors text-center"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
