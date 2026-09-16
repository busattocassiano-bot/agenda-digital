import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function Empresa() {
  const { companyData, saveCompanyData } = useCompany();
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    cep: '',
    country: '',
    uf: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
    logoBase64: '',
    businessHoursStart: '07:00',
    businessHoursEnd: '20:00'
  });

  const [activeTab, setActiveTab] = useState('gerais');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
    }
  }, [companyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate network delay
    setTimeout(() => {
      saveCompanyData(formData);
      setSaving(false);
      alert('Perfil salvo com sucesso!');
    }, 600);
  };

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* Sub-menu Lateral */}
      <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div 
          onClick={() => setActiveTab('gerais')}
          className="card" 
          style={{ padding: '16px', background: activeTab === 'gerais' ? 'white' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', color: activeTab === 'gerais' ? 'var(--primary-color)' : '#64748b', fontWeight: 600, borderLeft: activeTab === 'gerais' ? '4px solid var(--primary-color)' : '4px solid transparent', borderRadius: '8px', cursor: 'pointer' }}
        >
          <User size={20} />
          Dados Gerais
        </div>
        <div 
          onClick={() => setActiveTab('horarios')}
          className="card" 
          style={{ padding: '16px', background: activeTab === 'horarios' ? 'white' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', color: activeTab === 'horarios' ? 'var(--primary-color)' : '#64748b', fontWeight: 600, borderLeft: activeTab === 'horarios' ? '4px solid var(--primary-color)' : '4px solid transparent', borderRadius: '8px', cursor: 'pointer' }}
        >
          <User size={20} />
          Horários
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="card" style={{ flex: 1, padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '32px' }}>{activeTab === 'gerais' ? 'Perfil da Empresa' : 'Horários de Funcionamento'}</h2>
        
        {activeTab === 'gerais' && (
        <div style={{ display: 'flex', gap: '32px' }}>
          
          {/* Avatar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '200px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', overflow: 'hidden', background: formData.logoBase64 ? 'transparent' : 'white' }}>
              {formData.logoBase64 ? (
                <img src={formData.logoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.7)' }} />
              ) : (
                <User size={64} />
              )}
            </div>
            <input type="file" id="avatar" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            <label htmlFor="avatar" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <span style={{ border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', background: '#f8fafc', color: '#475569' }}>Escolher Arquivo</span>
              <span style={{ color: '#94a3b8' }}>
                {formData.logoBase64 ? 'Imagem selecionada' : 'Nenhum arquivo escolhido'}
              </span>
            </label>
          </div>

          {/* Form Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome da Empresa</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>CNPJ</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>CEP</label>
                  <input type="text" name="cep" value={formData.cep} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>País</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>UF</label>
                  <input type="text" name="uf" value={formData.uf} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Cidade</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Bairro</label>
                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Rua</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
            </div>

            {/* Row 4 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Número</label>
                <input type="text" name="number" value={formData.number} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Complemento</label>
                <input type="text" name="complement" value={formData.complement} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
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
        )}

        {activeTab === 'horarios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Configure os horários em que a agenda estará disponível para marcações.</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Horário de Início</label>
                <input type="time" name="businessHoursStart" value={formData.businessHoursStart || '07:00'} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Horário de Fim</label>
                <input type="time" name="businessHoursEnd" value={formData.businessHoursEnd || '20:00'} onChange={handleChange} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
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
        )}
      </div>
    </div>
  );
}
