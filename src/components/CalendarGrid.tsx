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
    let title = event.title;
    
    // Se for Culto tradicional (Preto), aplicamos as limpezas de palavras-chave
    if (event.color === '#000000') {
      return title.replace(/ - CULTO - /g, ' - ')
                  .replace(/^CULTO - /g, '')
                  .replace(/ - CULTO$/g, '')
                  .replace(/^CULTO: /g, '')
                  .replace(/^CULTO$/, 'CULTO');
    }

    // Para Meus Eventos (Vermelho), Pessoais (Azul) e Outros (Verde/Amarelo)
    // Tentamos simplificar para "Horário - Descrição" ou apenas "Descrição"
    const coloredCategories = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];
    if (coloredCategories.includes(event.color.toUpperCase())) {
      // Se tiver descrição, e o título for no formato "Horário - Categoria - Descrição"
      // ou "Categoria - Descrição", simplificamos.
      
      const parts = title.split(' - ');
      
      // Caso 1: "HH:MM - CATEGORIA - DESCRIÇÃO" -> "HH:MM - DESCRIÇÃO"
      if (parts.length >= 3 && /^\d{2}:\d{2}$/.test(parts[0])) {
        return `${parts[0]} - ${parts.slice(2).join(' - ')}`;
      }
      
      // Caso 2: "HH:MM - DESCRIÇÃO" -> Mantém como está (já está limpo)
      if (parts.length === 2 && /^\d{2}:\d{2}$/.test(parts[0])) {
        return title;
      }

      // Caso 3: "CATEGORIA - DESCRIÇÃO" -> "DESCRIÇÃO"
      if (parts.length >= 2 && !/^\d{2}:\d{2}$/.test(parts[0])) {
        return parts.slice(1).join(' - ');
      }
    }

    return title;
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
