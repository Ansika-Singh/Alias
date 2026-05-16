import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CampusCalendar = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 16)); // Fixed date for demo consistency

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth(year, month); i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    
    days.push(
      <div key={d} className={`calendar-day ${dayEvents.length > 0 ? 'has-event' : ''}`}>
        <span className="day-number">{d}</span>
        <div className="event-indicators">
          {dayEvents.map((e, i) => (
            <div key={i} className={`event-dot ${e.type}`} title={e.title}></div>
          ))}
        </div>
        {dayEvents.length > 0 && (
          <div className="event-tooltip">
            {dayEvents.map((e, i) => (
              <div key={i} className="tooltip-item">
                <strong>{e.type.toUpperCase()}:</strong> {e.title}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="campus-calendar">
      <div className="calendar-controls">
        <h4>{monthNames[month]} {year}</h4>
        <div className="control-btns">
          <button onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
          <button onClick={handleNextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days}
      </div>
      <div className="calendar-legend">
        <div className="legend-item"><span className="dot event"></span> Event</div>
        <div className="legend-item"><span className="dot holiday"></span> Holiday</div>
        <div className="legend-item"><span className="dot festival"></span> Festival</div>
      </div>
    </div>
  );
};

export default CampusCalendar;
