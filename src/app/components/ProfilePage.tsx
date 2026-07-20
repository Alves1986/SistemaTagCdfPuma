import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProfile } from '../lib/supabase';
import * as api from '../services/api';
import { User, Phone, Camera, Save, MapPin, Briefcase, X, Check, Users } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { getCoordenador } from '../utils/hierarchy';

export function ProfilePage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ whatsapp: '', foto_url: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        whatsapp: user.whatsapp || '',
        foto_url: user.foto_url || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccessMsg('');
    const success = await api.updateProfile(user.id, formData);
    if (success) {
      setSuccessMsg('Perfil atualizado com sucesso!');
      // Atualizar o contexto local recarregando a página ou atualizando o estado do AuthContext (idealmente recarregar para simplicidade ou via hook)
      setTimeout(() => window.location.reload(), 1500);
    } else {
      alert('Erro ao atualizar perfil.');
    }
    setSaving(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImageSrc(reader.result?.toString() || null)
      );
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;
    try {
      setUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImage) throw new Error("Falha ao cortar a imagem");
      
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `perfis/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, croppedImage, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, foto_url: data.publicUrl }));
      setImageSrc(null); // close cropper
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      alert('Erro ao fazer upload da foto. Verifique se o bucket "fotos" foi criado.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary via-primary to-[#002040]"></div>
        
        <div className="px-8 pb-8 -mt-16 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden mb-4 relative group">
            {formData.foto_url ? (
              <img src={formData.foto_url} alt="Minha Foto" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-muted-foreground" />
            )}
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-sm font-bold">
              <Camera size={24} className="mb-1" />
              Alterar
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
            </label>
          </div>

          {uploading && <p className="text-sm text-primary animate-pulse mb-4">Enviando foto...</p>}

          <h1 className="font-bold text-foreground text-2xl mb-1">{user.nome}</h1>
          <div className="flex flex-col items-center gap-1 mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
              {user.cargo}
            </span>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-2">
              <span className="font-mono bg-muted/50 px-2 py-0.5 rounded border border-border">PRN: {user.prn}</span>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8 bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-background rounded border border-border"><Briefcase size={16} /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Gerência</p>
                <p className="text-foreground font-medium">{user.gerencia || 'Não informada'}</p>
              </div>
            </div>
            {user.coordenacao && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-background rounded border border-border"><Briefcase size={16} /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Coordenação</p>
                  <p className="text-foreground font-medium">{user.coordenacao}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-background rounded border border-border"><MapPin size={16} /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Área</p>
                <p className="text-foreground font-medium">{user.areas_coordenadas?.join(', ') || user.area || 'Não informada'}</p>
              </div>
            </div>
            {(user.coordenacao || user.area) && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-background rounded border border-border"><Users size={16} /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Líder / Coordenador</p>
                  <p className="text-foreground font-medium">{getCoordenador(user.coordenacao || user.area || '')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Informações de Contato</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp / Telefone</label>
              <div className="relative max-w-md mx-auto md:mx-0">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="w-full mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded text-center text-sm font-medium">
              {successMsg}
            </div>
          )}

          <div className="w-full mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={uploading || saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg">Ajustar Foto</h3>
              <button onClick={() => setImageSrc(null)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black/90">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 bg-muted/30 border-t border-border space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setImageSrc(null)}
                  className="flex-1 py-2 px-4 rounded-lg border border-border font-medium hover:bg-muted transition-colors text-sm"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCropSave}
                  disabled={uploading}
                  className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <span className="animate-pulse">Salvando...</span>
                  ) : (
                    <>
                      <Check size={18} />
                      Recortar e Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
