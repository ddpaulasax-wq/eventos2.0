import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Download, Printer, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  calendarMode: 'geral' | 'cultos';
  onToggleMode: () => void;
  onAutoRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onAddEvent,
  calendarMode,
  onToggleMode,
  onAutoRegister
}) => {
  return (
    <header className="fade-in header-container">
      <div className="header-top">
        <div className="header-info">
          <div className="month-year">
            <h1>
              {format(currentDate, 'MMMM', { locale: ptBR })}
              <span>{format(currentDate, 'yyyy')}</span>
            </h1>
          </div>

          <div className="btn-group-nav">
            <button className="btn-nav-round" onClick={onPrevMonth}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-hoje-text" onClick={onToday}>Hoje</button>
            <button className="btn-nav-round" onClick={onNextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="header-controls">

          {/* Toggle Calendário */}
          <div className="toggle-calendar-container">
            <button
              onClick={() => calendarMode !== 'geral' && onToggleMode()}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: calendarMode === 'geral' ? 'white' : 'transparent',
                color: calendarMode === 'geral' ? '#1E293B' : '#94A3B8',
                boxShadow: calendarMode === 'geral' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              GERAL
            </button>
            <button
              onClick={() => calendarMode !== 'cultos' && onToggleMode()}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: calendarMode === 'cultos' ? '#EF4444' : 'transparent',
                color: calendarMode === 'cultos' ? 'white' : '#94A3B8',
                boxShadow: calendarMode === 'cultos' ? '0 1px 3px rgba(239,68,68,0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              CULTOS
            </button>
          </div>

          <button className="btn-pill" onClick={() => {}}>
            <Download size={16} /> Exportar CSV
          </button>
          <button 
            className="btn-pill" 
            onClick={() => window.print()} 
            title="Imprimir"
            translate="no"
          >
            <Printer size={16} /> <span className="hide-mobile">Imprimir</span>
          </button>
          <div className="actions-column">
            <div className="actions-row">
              <button 
                className="btn-pill" 
                onClick={onAutoRegister}
                style={{ 
                  background: calendarMode === 'cultos' ? '#1E293B' : '#EF4444', 
                  color: 'white', 
                  borderColor: calendarMode === 'cultos' ? '#1E293B' : '#EF4444' 
                }}
                title={calendarMode === 'cultos' ? "Cadastrar cultos fixos para este mês" : "Cadastrar eventos musicais fixos"}
              >
                <Wand2 size={18} /> <span className="hide-mobile">Autocadastro</span>
              </button>
              <button className="btn-pill btn-pill-blue" onClick={onAddEvent}>
                <Plus size={20} /> <span className="hide-mobile">Novo</span>
              </button>
            </div>
            <span style={{ fontSize: '0.625rem', color: '#CBD5E1', textAlign: 'center' }}>
              Otimizado para impressão em modo Paisagem.<br/>Se a impressão não abrir, use uma nova aba.
            </span>
          </div>
        </div>
      </div>

      <div className="legend-container">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--color-meus)' }}></div>
              MEUS EVENTOS
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--color-conservos)' }}></div>
              EVENTOS DOS CONSERVOS
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--color-pessoais)' }}></div>
              PESSOAIS
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--color-outros)' }}></div>
              OUTROS / EVENTO
            </div>
      </div>
    </header>
  );
};
