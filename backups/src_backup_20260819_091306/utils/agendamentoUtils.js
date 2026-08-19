export const getMins = (hora, horaFim) => {
  const [h, m] = (hora || '00:00').split(':').map(Number);
  const start = h * 60 + m;
  let end = start + 60; // Default 1 hr if no horaFim
  if (horaFim) {
    const [eH, eM] = horaFim.split(':').map(Number);
    end = eH * 60 + eM;
  }
  return { start, end };
};

/**
 * Checks if a proposed appointment (or series of appointments) overlaps with existing ones
 * and whether it violates capacity (clientesMax) or mixes different services for the same professional.
 * 
 * @param {Array} agendamentos - Existing appointments
 * @param {Object} proposed - { dataStr, hora, horaFim, profissionalId, servico, excludeId }
 * @param {Array} servicos - Service definitions to look up clientesMax
 * @returns {Object} { hasConflict: boolean, message: string }
 */
export const checkOverlapsAndCapacity = (agendamentos, proposed, servicos) => {
  const { dataStr, hora, horaFim, profissionalId, servico, excludeId } = proposed;
  const servicoInfo = servicos.find(s => s.nome === servico);
  const clientesMax = servicoInfo && servicoInfo.clientesMax ? parseInt(servicoInfo.clientesMax, 10) : 1;

  const times = getMins(hora, horaFim);

  // Find all overlapping appointments for this professional on this day
  const overlaps = agendamentos.filter(a => {
    if (a.data !== dataStr || a.status === 'cancelado') return false;
    if (excludeId && a.id === excludeId) return false;
    if (String(a.profissionalId) !== String(profissionalId)) return false;

    const aTimes = getMins(a.hora, a.horaFim);
    return Math.max(times.start, aTimes.start) < Math.min(times.end, aTimes.end);
  });

  if (overlaps.length === 0) {
    return { hasConflict: false, message: '' };
  }

  // Check 1: Mixing different services
  const differentServiceOverlap = overlaps.find(a => a.servico !== servico);
  if (differentServiceOverlap) {
    return { 
      hasConflict: true, 
      message: `Conflito de serviços: O profissional já tem um agendamento de "${differentServiceOverlap.servico}" neste horário. Não é permitido misturar serviços diferentes no mesmo horário.`
    };
  }

  // Check 2: Exceeding capacity
  if (overlaps.length >= clientesMax) {
    return {
      hasConflict: true,
      message: `Limite excedido: O serviço "${servico}" permite no máximo ${clientesMax} paciente(s) por horário. O horário ${hora} no dia ${dataStr.split('-').reverse().join('/')} já está lotado.`
    };
  }

  return { hasConflict: false, message: '' };
};
