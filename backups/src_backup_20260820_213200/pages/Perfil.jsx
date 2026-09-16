import React, { useState, useEffect, useCallback } from 'react';
import { User, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Cropper from 'react-easy-crop';
import getCroppedImgBase64 from '../utils/cropImage';

export default function Perfil() {
  const { currentUser, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cargo: '',
    avatarBase64: ''
  });
  const [saving, setSaving] = useState(false);

  // Crop states
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        cargo: currentUser.cargo || 'Instrutor / Fisioterapeuta',
        avatarBase64: currentUser.avatarBase64 || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    e.target.value = '';
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImgBase64(imageSrc, croppedAreaPixels);
      setFormData(prev => ({ ...prev, avatarBase64: croppedImage }));
      setShowCropModal(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateUser(formData);
      setSaving(false);
      alert('Perfil salvo com sucesso!');
    }, 600);
  };
  
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      
      {showCropModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Ajustar Foto</h3>
              <button onClick={() => setShowCropModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
              <button onClick={() => setShowCropModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={handleCropSave} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Cortar e Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary-color)', fontWeight: 600, borderLeft: '4px solid var(--primary-color)', borderRadius: '8px' }}>
          <User size={20} />
          Meu Perfil
        </div>
      </div>

      <div className="card" style={{ flex: 1, padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '32px' }}>Dados do Usuário</h2>
        
        <div style={{ display: 'flex', gap: '32px' }}>
          
          {/* Avatar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '200px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', overflow: 'hidden', background: formData.avatarBase64 ? 'transparent' : 'white' }}>
              {formData.avatarBase64 ? (
                <img src={formData.avatarBase64} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={64} />
              )}
            </div>
            <input type="file" id="user-avatar" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            <label htmlFor="user-avatar" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <span style={{ border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', background: '#f8fafc', color: '#475569' }}>Alterar Foto</span>
            </label>
          </div>

          {/* Form Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', background: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Email</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', background: 'white' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Cargo</label>
                <select name="cargo" value={formData.cargo} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', background: 'white' }}>
                  <option value="Administrador">Administrador</option>
                  <option value="Instrutor / Fisioterapeuta">Instrutor / Fisioterapeuta</option>
                  <option value="Instrutor">Instrutor</option>
                  <option value="Fisioterapeuta">Fisioterapeuta</option>
                  <option value="Recepcionista">Recepcionista</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                onClick={handleSave} 
                disabled={saving}
                style={{ background: '#74c084', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
