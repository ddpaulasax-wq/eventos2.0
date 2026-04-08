import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { format } from 'date-fns';
// ptBR removed as it's not used here


interface Event {
  id: string;
  groupId?: string;
  title: string;
  date: Date;
  description: string;
  color: string;
  calendarType: 'geral' | 'cultos';
}

interface EventModalProps {
  isOpen: boolean;
  editingEvent: Event | null;
  onClose: () => void;
  selectedDate: Date;
  calendarMode: 'geral' | 'cultos';
  onAddEvent: (title: string, description: string, color: string, recurrence: string) => Promise<void>;
  onDelete: (id: string, groupId?: string, deleteAllSeries?: boolean) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  editingEvent,
  onClose, 
  selectedDate,
  calendarMode,
  onAddEvent,
  onDelete
}) => {

  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [category, setCategory] = useState({ name: 'CULTO', color: '#EF4444' });
  const [isDeletingRecurrent, setIsDeletingRecurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const defaultCategory = calendarMode === 'cultos' 
      ? { name: 'CULTO', color: '#000000' }
      : { name: 'CULTO', color: '#EF4444' };

    if (editingEvent) {
      const parts = editingEvent.title.split(' - ');
      let displayTime = '';
      let displayText = editingEvent.title;

      if (parts.length >= 2 && /^\d{2}:\d{2}$/.test(parts[0])) {
        displayTime = parts[0];
        displayText = parts.slice(1).join(' - ');
      }

      setTime(displayTime);
      setDescription(editingEvent.description || displayText);
      
      // Tenta inferir a categoria pela cor ou nome
      if (calendarMode === 'cultos') {
        const isSpecial = editingEvent.color === '#EF4444';
        setCategory(isSpecial ? { name: 'CULTO ESPECIAL', color: '#EF4444' } : { name: 'CULTO', color: '#000000' });
      } else {
        setCategory({ name: editingEvent.title.includes(' - ') ? editingEvent.title.split(' - ').pop()! : editingEvent.title, color: editingEvent.color });
      }
      setRecurrence('none');
      setIsDeletingRecurrent(false);
      setIsSaving(false);
    } else {
      setDescription('');
      setTime('');
      setCategory(defaultCategory);
      setRecurrence('none');
      setIsDeletingRecurrent(false);
      setIsSaving(false);
    }
  }, [editingEvent, isOpen, calendarMode]);

  if (!isOpen) return null;

  // Categorias que usam a descrição como título no calendário
  const descriptionAsTitle = ['MEUS EVENTOS', 'EVENTOS PESSOAIS', 'OUTROS', 'EVENTO', 'CULTO ESPECIAL'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const trimmedDesc = description.trim();
      let displayCategory = category.name;
      
      if (category.name === 'OUTROS') {
        displayCategory = 'OUTRO';
      }

      let finalTitle = '';
      if (trimmedDesc) {
        // Se houver descrição, ela será o título principal (limpo)
        finalTitle = trimmedDesc;
      } else {
        // Fallback para o nome da categoria se a descrição for vazia
        finalTitle = displayCategory;
      }

      if (time) {
        finalTitle = `${time} - ${finalTitle}`;
      }

      // Passamos a descrição completa para o banco, mas a exibição principal será o título formatado
      await onAddEvent(finalTitle, trimmedDesc, category.color, recurrence);

      setDescription('');
      setTime('');
      setRecurrence('none');
      setIsDeletingRecurrent(false);
      onClose();
    } catch (error) {
      console.error('Erro no submit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // No modo cultos: força categorias específicas (CULTO tradicional e CULTO ESPECIAL)
  const isCultosMode = calendarMode === 'cultos';

  const categories = [
    { label: 'MEUS EVENTOS', color: '#EF4444', items: ['CULTO', 'GEM', 'ENSAIO', 'REUNIÃO'], singleButton: false },
    { label: 'EVENTOS DOS CONSERVOS', color: '#F59E0B', items: ['CULTO', 'ENSAIO', 'REUNIÃO'], singleButton: false },
    { label: 'EVENTOS PESSOAIS', color: '#3B82F6', items: [], singleButton: true },
    { label: 'OUTROS', color: '#10B981', items: [], singleButton: true },
    { label: 'EVENTO', color: '#10B981', items: [], singleButton: true },
  ];

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content">
        <div className="modal-title-row" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: '0.5rem' }}>
          <h2 className="modal-title">{editingEvent ? 'Editar Compromisso' : 'Novo Compromisso'}</h2>
          <button onClick={onClose} className="btn-nav-round" style={{ background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Modo Cultos: Alternância entre CULTO (Preto) e CULTO ESPECIAL (Vermelho) */}
          {isCultosMode ? (
            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '1rem' }}>Tipo de Evento</p>
              <div className="chips-row">
                <button
                  type="button"
                  translate="no"
                  className={`chip-btn ${category.name === 'CULTO' ? 'selected' : ''}`}
                  style={{ 
                    color: category.name === 'CULTO' ? '#000000' : '#94A3B8', 
                    borderColor: category.name === 'CULTO' ? '#000000' : '#E2E8F0', 
                    background: category.name === 'CULTO' ? '#F8FAFC' : 'white' 
                  }}
                  onClick={() => setCategory({ name: 'CULTO', color: '#000000' })}
                >
                  CULTO
                </button>
                <button
                  type="button"
                  translate="no"
                  className={`chip-btn ${category.name === 'CULTO ESPECIAL' ? 'selected' : ''}`}
                  style={{ 
                    color: category.name === 'CULTO ESPECIAL' ? '#EF4444' : '#94A3B8', 
                    borderColor: category.name === 'CULTO ESPECIAL' ? '#EF4444' : '#E2E8F0', 
                    background: category.name === 'CULTO ESPECIAL' ? '#FEF2F2' : 'white' 
                  }}
                  onClick={() => setCategory({ name: 'CULTO ESPECIAL', color: '#EF4444' })}
                >
                  CULTO ESPECIAL
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Botões únicos: EVENTOS PESSOAIS e OUTROS */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                {categories.filter(g => g.singleButton).map((group) => {
                  const isSelected = category.name === group.label && category.color === group.color;
                  return (
                    <button
                      key={group.label}
                      type="button"
                      translate="no"
                      className={`chip-btn ${isSelected ? 'selected' : ''}`}
                      style={{
                        color: isSelected ? group.color : '#94A3B8',
                        borderColor: isSelected ? group.color : '#E2E8F0',
                        background: isSelected ? `${group.color}10` : 'white'
                      }}
                      onClick={() => setCategory({ name: group.label, color: group.color })}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>

              {/* Status só aparece quando NÃO é categoria única */}
              {!descriptionAsTitle.includes(category.name) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '1rem' }}>Status / Prioridade</p>
                  {categories.filter(g => !g.singleButton).map((group) => (
                    <div key={group.label}>
                      <p className="category-group-label" style={{ color: group.color }}>{group.label}</p>
                      <div className="chips-row">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            translate="no"
                            className={`chip-btn ${category.name === item && category.color === group.color ? 'selected' : ''}`}
                            style={{ 
                              color: category.name === item && category.color === group.color ? group.color : '#94A3B8',
                              borderColor: category.name === item && category.color === group.color ? group.color : '#E2E8F0',
                              background: category.name === item && category.color === group.color ? `${group.color}10` : 'white'
                            }}
                            onClick={() => setCategory({ name: item, color: group.color })}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>Data de Início</label>
              <div className="form-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                {format(selectedDate, 'dd/MM/yyyy')}
                <CalendarIcon size={18} />
              </div>
            </div>
            <div className="form-field">
              <label>Hora</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="time" 
                  className="form-input" 
                  style={{ width: '100%' }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#2563EB' }}>
              <Repeat size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Recorrência</span>
            </div>
            <div className="form-field">
              <label style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Frequência</label>
              <select 
                className="form-input" 
                style={{ width: '100%', background: 'white' }}
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option value="none">Não se repete</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '1rem' }}>
            <label style={descriptionAsTitle.includes(category.name) ? { color: category.color, fontWeight: 700 } : {}}>
              {descriptionAsTitle.includes(category.name) ? 'Descrição (será o título no calendário)' : 'Descrição / Compromisso'}
            </label>
            <textarea 
              className="form-textarea" 
              style={{ 
                minHeight: '80px', 
                border: `1px solid ${descriptionAsTitle.includes(category.name) ? category.color + '60' : '#E2E8F0'}`, 
                borderRadius: '0.5rem', 
                padding: '0.75rem', 
                outline: 'none' 
              }}
              placeholder={descriptionAsTitle.includes(category.name) ? 'Ex: Aniversário do João, Viagem para SP...' : 'Opcional (ex: Visita ao irmão João)'}
              value={description}
              required={descriptionAsTitle.includes(category.name)}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {editingEvent && (
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                {isDeletingRecurrent ? (
                  <>
                    <button 
                      type="button" 
                      className="btn-pill btn-outline-red" 
                      style={{ flex: 1, padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => onDelete(editingEvent.id, undefined, false)}
                    >
                      Apenas este
                    </button>
                    <button 
                      type="button" 
                      className="btn-pill btn-pill-blue" 
                      style={{ flex: 1, padding: '0.75rem 0.5rem', fontSize: '0.75rem', background: '#EF4444' }}
                      onClick={() => onDelete(editingEvent.id, editingEvent.groupId, true)}
                    >
                      Toda série
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    className="btn-pill btn-outline-red" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      if (editingEvent.groupId) {
                        setIsDeletingRecurrent(true);
                      } else {
                        onDelete(editingEvent.id);
                      }
                    }}
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
            <button 
              type="submit" 
              disabled={isSaving}
              className={`btn-pill ${isSaving ? 'btn-outline-red' : 'btn-pill-blue'}`}
              style={{ 
                flex: 2, 
                justifyContent: 'center',
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// End of file

