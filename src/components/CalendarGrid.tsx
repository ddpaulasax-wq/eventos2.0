import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  format,
  isToday
} from 'date-fns';
import { Repeat } from 'lucide-react';


interface Event {
  id: string;
  groupId?: string;
  title: string;
  date: Date;
  description: string;
  color: string;
  calendarType: 'geral' | 'cultos';
}

interface CalendarGridProps {
  currentDate: Date;
  onSelectDay: (day: Date) => void;
  onEditEvent: (event: Event) => void;
  events: Event[];
  calendarMode: 'geral' | 'cultos';
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  onSelectDay, 
  onEditEvent, 
  events,
  calendarMode
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const formatTitle = (event: Event) => {
    // 1. Definimos o que queremos esconder (letras maiúsculas para comparação segura)
    const toHide = ['OUTRO', 'OUTROS', 'EVENTO', 'CULTO', 'CULTOS', 'PESSOAL', 'PESSOAIS', 'MEUS EVENTOS', 'ENSAIO', 'GEM', 'REUNIÃO', 'SECRETARIA'];
    
    // 2. Quebramos o título por qualquer tipo de traço com espaços
    const parts = event.title.split(/\s*[\-–—]\s*/);
    
    // 3. Filtramos as partes
    const filtered = parts.filter((part, index) => {
      const p = part.trim().toUpperCase();
      // Sempre mantém se for a primeira parte e for um horário (ex: 15:00)
      if (index === 0 && /^\d{1,2}:\d{2}$/.test(p)) return true;
      // Remove se for uma palavra da lista de categorias
      if (toHide.includes(p)) return false;
      // Remove se a parte for vazia
      if (!p) return false;
      return true;
    });

    // 4. Se o resultado for vazio (ex: evento era só "OUTRO"), retorna o título original como fallback
    if (filtered.length === 0) return event.title;

    // 5. Junta tudo com o separador padrão
    return filtered.join(' - ');
  };

  return (
    <div className="calendar-card fade-in">
      {/* New unified grid for header and days to guarantee alignment */}
      <div className="calendar-main-grid">
        {/* Weekday labels */}
        {weekDays.map((day) => (
          <div key={day} className="weekday-label" translate="no" style={{ borderRight: day !== 'SÁB' ? '1px solid #F1F5F9' : 'none' }}>
            {day}
          </div>
        ))}

        {/* Day boxes */}
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, currentDate);
          const dayEvents = events.filter(e => isSameDay(e.date, day));

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`day-box ${!isCurrentMonth ? 'not-curr-month' : ''} ${isToday(day) ? 'is-today' : ''}`}
              style={{ background: isSelected ? '#F8FAFC' : 'transparent' }}
            >
              <span className="day-num">
                {format(day, 'd')}
              </span>
              
              <div className="events-list">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className="event-item-grid"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(event);
                    }}
                    style={{ 
                      background: `${event.color}15`,
                      color: event.color,
                      border: `1px solid ${event.color}30`
                    }}
                    title={event.title}
                  >
                    <div className="event-title-span" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {event.groupId && <Repeat size={10} style={{ flexShrink: 0 }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formatTitle(event)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
