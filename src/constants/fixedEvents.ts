export interface FixedEvent {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  time: string;
  locals: string[];
}

export const FIXED_CULTOS: FixedEvent[] = [
  { 
    dayOfWeek: 1, // Segunda
    time: '19:30', 
    locals: ['ALAG. VELHA', 'PÇA. KENNEDY', 'PETROLAR'] 
  },
  { 
    dayOfWeek: 2, // Terça
    time: '19:30', 
    locals: ['CENTRAL', 'COQUEIRO - Aramari', '2 DE JULHO', 'JORGE AMADO', 'MANGALÔ', 'PQ. S. FRANCISCO'] 
  },
  { 
    dayOfWeek: 3, // Quarta
    time: '15:00', 
    locals: ['PÇA. KENNEDY'] 
  },
  { 
    dayOfWeek: 3, // Quarta
    time: '19:30', 
    locals: ['ALAG. VELHA', 'BRESPEL', 'PETROLAR', 'QUINTINO', 'RUA DO CATU', 'STA TEREZINHA'] 
  },
  { 
    dayOfWeek: 4, // Quinta
    time: '19:30', 
    locals: ['CENTRAL'] 
  },
  { 
    dayOfWeek: 5, // Sexta
    time: '19:30', 
    locals: ['MANGALÔ', 'PQ. S. FRANCISCO', 'QUINTINO', 'STA TEREZINHA', 'JORGE AMADO'] 
  },
  { 
    dayOfWeek: 6, // Sábado
    time: '19:30', 
    locals: ['ALAG. VELHA', 'BRESPEL', 'COQUEIRO', '2 DE JULHO', 'PÇA. KENNEDY', 'PETROLAR'] 
  },
  { 
    dayOfWeek: 0, // Domingo
    time: '18:30', 
    locals: ['CENTRAL', 'MANGALÔ', 'QUINTINO', 'RUA DO CATU', 'STA TEREZINHA'] 
  }
];
