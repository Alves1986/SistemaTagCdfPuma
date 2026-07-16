import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProfile } from '../lib/supabase';
import * as api from '../services/api';
import { Users, Phone, Camera, Save, X, Edit2, ShieldAlert } from 'lucide-react';
import { GERENCIAS, getAreasByGerencia, getCargosByGerencia } from '../utils/hierarchy';

export function TeamPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ 
    whatsapp: '', 
    foto_url: '',
    cargo: '',
    gerencia: '',
    area: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    const data = await api.getAllProfiles();
    setProfiles(data);
    setLoading(false);
  };

  const openEditModal = (profile: UserProfile) => {
    setEditingProfile(profile);
    setFormData({
      whatsapp: profile.whatsapp || '',
      foto_url: profile.foto_url || '',
      cargo: profile.cargo || 'Operador II',
      gerencia: profile.gerencia || 'Utilidades',
      area: profile.area || 'CDF2 / ETAC2'
    });
  };

  const handleSave = async () => {
    if (!editingProfile) return;
    const success = await api.updateProfile(editingProfile.id, formData);
    if (success) {
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...formData } : p));
      setEditingProfile(null);
    } else {
      alert('Erro ao atualizar perfil.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProfile) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `perfis/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, foto_url: data.publicUrl }));
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      alert('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const formatWhatsapp = (val: string) => {
    // Formatação simples para visualização (adicionando +55 se for BR e espaço)
    if (!val) return 'Não informado';
    return val;
  };

  // Restringir acesso
  const isAdmin = ['Operador Lider', 'Coordenador', 'Especialista', 'Engenheiro', 'Assistente Tecnico'].includes(user?.cargo || '');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert size={48} className="text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2">Apenas Gestores têm acesso a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded border border-border p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestão de Equipe</h1>
            <p className="text-sm text-muted-foreground">Visualize e gerencie os perfis e contatos do time.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando equipe...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profiles.map(profile => (
            <div key={profile.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col">
              <div className="h-20 bg-gradient-to-r from-primary to-[#002040]"></div>
              <div className="px-5 pb-5 flex-1 flex flex-col items-center text-center -mt-10">
                <div className="w-20 h-20 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden mb-3">
                  {profile.foto_url ? (
                    <img src={profile.foto_url} alt={profile.nome} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">{profile.nome.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-lg">{profile.nome}</h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mt-1 mb-4">
                  {profile.cargo}
                </span>
                
                <div className="w-full space-y-2 mt-auto">
                  {profile.gerencia && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                      <span className="font-semibold uppercase">Gerência:</span> {profile.gerencia}
                    </div>
                  )}
                  {profile.area && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                      <span className="font-semibold uppercase">Área:</span> {profile.area}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Phone size={14} />
                    <span>{formatWhatsapp(profile.whatsapp || '')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <span className="font-mono bg-muted px-1.5 rounded text-xs">PRN: {profile.prn}</span>
                  </div>
                </div>

                <button 
                  onClick={() => openEditModal(profile)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded bg-primary/10 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                >
                  <Edit2 size={14} />
                  Editar Contato
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded shadow-2xl w-full max-w-sm border border-border p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">Editar: {editingProfile.nome}</h3>
              <button onClick={() => setEditingProfile(null)} className="text-muted-foreground hover:bg-muted p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Foto */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center relative group">
                  {formData.foto_url ? (
                    <img src={formData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-muted-foreground" />
                  )}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-bold">
                    <Camera size={18} className="mb-1" />
                    Alterar
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
                {uploading && <p className="text-xs text-primary animate-pulse">Enviando foto...</p>}
              </div>

              {/* Selects Adicionais para Gestão */}
              <div>
                <label className="block text-sm font-medium mb-1">Gerência</label>
                <select
                  value={formData.gerencia}
                  onChange={e => {
                    const newGerencia = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      gerencia: newGerencia,
                      area: getAreasByGerencia(newGerencia)[0],
                      cargo: getCargosByGerencia(newGerencia)[0]
                    }));
                  }}
                  className="w-full px-3 py-2 rounded border border-border bg-muted/50 text-foreground outline-none focus:border-primary"
                >
                  {GERENCIAS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Área / Setor</label>
                  <select
                    value={formData.area}
                    onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-3 py-2 rounded border border-border bg-muted/50 text-foreground outline-none focus:border-primary"
                  >
                    {getAreasByGerencia(formData.gerencia).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Função / Cargo</label>
                  <select
                    value={formData.cargo}
                    onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                    className="w-full px-3 py-2 rounded border border-border bg-muted/50 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {getCargosByGerencia(formData.gerencia).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input WhatsApp */}
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      let formatted = val;
                      if (val.length > 2 && val.length <= 6) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                      else if (val.length > 6 && val.length <= 10) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
                      else if (val.length > 10) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
                      setFormData(prev => ({ ...prev, whatsapp: formatted }));
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full pl-9 pr-3 py-2 rounded border border-border bg-muted/50 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                Salvar Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
