import React, { useState, useEffect } from 'react';
import { 
  addMonths, 
  subMonths, 
  addDays, 
  addWeeks, 
  addYears,
  parseISO
} from 'date-fns';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { EventModal } from './components/EventModal';
import { supabase } from './lib/supabase';

interface Event {
  id: string;
  groupId?: string;
  title: string;
  date: Date;
  description: string;
  color: string;
  calendarType: 'geral' | 'cultos';
}

type CalendarMode = 'geral' | 'cultos';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('geral');

  // Re-carrega eventos ao trocar de calendário
  useEffect(() => {
    fetchEvents();
  }, [calendarMode]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('calendar_type', calendarMode);

      if (error) throw error;

      const loadedEvents = data.map(event => ({
        ...event,
        date: parseISO(event.date),
        groupId: event.group_id,
        calendarType: event.calendar_type
      }));
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string, groupId?: string, deleteAll: boolean = false) => {
    try {
      if (deleteAll && groupId) {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('group_id', groupId);

        if (error) throw error;

        setEvents(events.filter(e => e.groupId !== groupId));
      } else {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setEvents(events.filter(e => e.id !== id));
      }

      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erro ao excluir compromisso');
    }
  };

  const handleAddEvent = async (title: string, description: string, color: string, recurrence: string = 'none') => {
    try {
      if (editingEvent) {
        // Update existing
        const { error } = await supabase
          .from('events')
          .update({ 
            title, 
            description, 
            color,
            date: selectedDate.toISOString() 
          })
          .eq('id', editingEvent.id);

        if (error) throw error;

        setEvents(events.map(e => e.id === editingEvent.id ? { ...e, title, description, color, date: selectedDate } : e));
        setIsModalOpen(false);
        setEditingEvent(null);
        return;
      }

      const groupId = Math.random().toString(36).substr(2, 9);
      const newEventsData: any[] = [];
      
      let iterations = 1;
      let addFn: (date: Date, duration: number) => Date = addDays;

      switch (recurrence) {
        case 'daily': iterations = 60; addFn = addDays; break;
        case 'weekly': iterations = 52; addFn = addWeeks; break;
        case 'monthly': iterations = 12; addFn = addMonths; break;
        case 'yearly': iterations = 5; addFn = addYears; break;
        default: iterations = 1; break;
      }

      for (let i = 0; i < iterations; i++) {
        newEventsData.push({
          group_id: iterations > 1 ? groupId : null,
          title,
          description,
          date: addFn(selectedDate, i).toISOString(),
          color: color || '#2563EB',
          calendar_type: calendarMode
        });
      }

      const { data, error } = await supabase
        .from('events')
        .insert(newEventsData)
        .select();

      if (error) throw error;

      const createdEvents = data.map((event: any) => ({
        ...event,
        date: parseISO(event.date),
        groupId: event.group_id,
        calendarType: event.calendar_type
      }));

      setEvents([...events, ...createdEvents]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Erro ao salvar compromisso');
    }
  };

  // Eventos já filtrados pelo fetch (por calendar_type)
  const visibleEvents = events;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100">
      <Header 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onAddEvent={() => setIsModalOpen(true)}
        calendarMode={calendarMode}
        onToggleMode={() => setCalendarMode(m => m === 'geral' ? 'cultos' : 'geral')}
      />

      <main className="flex-1 flex flex-col gap-6">
        {loading ? (
          <div className="calendar-card flex items-center justify-center" style={{ minHeight: '600px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CalendarGrid 
            currentDate={currentDate}
            onSelectDay={handleSelectDay}
            onEditEvent={handleEditEvent}
            events={visibleEvents}
            calendarMode={calendarMode}
          />
        )}
        
        <footer className="glass p-4 rounded-xl text-center text-slate-500 text-xs mt-auto">
          {calendarMode === 'cultos' ? 'Calendário de Cultos' : 'Calendário de Eventos Musicais'}
        </footer>
      </main>

      <EventModal 
        isOpen={isModalOpen}
        editingEvent={editingEvent}
        selectedDate={selectedDate}
        calendarMode={calendarMode}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onAddEvent={handleAddEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default App;
