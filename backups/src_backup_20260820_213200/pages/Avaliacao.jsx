import React from 'react';

export default function Avaliacao() {
  return (
    <div className="avaliacao-page">
      <h1 className="page-title">Nova Avaliação</h1>
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
        <h3 className="mb-4">Ficha Fisioterapêutica</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Paciente</label>
            <select className="form-control">
              <option>Selecione um paciente</option>
              <option>João Santos</option>
            </select>
          </div>
          <div className="form-group">
            <label>Data da Avaliação</label>
            <input type="date" className="form-control" />
          </div>
        </div>

        <div className="form-group">
          <label>Queixa Principal (HDA)</label>
          <textarea className="form-control" rows="3" placeholder="Descreva a queixa do paciente..."></textarea>
        </div>

        <div className="form-group">
          <label>Exame Físico / Testes Especiais</label>
          <textarea className="form-control" rows="4" placeholder="Detalhes da inspeção, palpação e testes..."></textarea>
        </div>

        <div className="form-group">
          <label>Diagnóstico Fisioterapêutico</label>
          <input type="text" className="form-control" placeholder="HD..." />
        </div>

        <div className="form-group">
          <label>Plano de Tratamento</label>
          <textarea className="form-control" rows="3" placeholder="Objetivos e condutas..."></textarea>
        </div>

        <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary">Cancelar</button>
          <button className="btn btn-primary">Salvar Avaliação</button>
        </div>
      </div>
    </div>
  );
}
