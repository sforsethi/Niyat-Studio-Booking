import React, { useState } from 'react';

interface CalendarProps {
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    if (selectedDate >= today || selectedDate.toDateString() === today.toDateString()) {
      // Use raw values directly without Date object methods
      const year = currentYear;
      const month = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;
      
      // Update debug info
      const debugMessage = `Clicked day ${day} in ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonth]} ${currentYear}. Created: ${dateString}`;
      setDebugInfo(debugMessage);
      
      onDateSelect(dateString);
    }
  };
  
  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < today && date.toDateString() !== today.toDateString();
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day);
      const isToday = new Date(currentYear, currentMonth, day).toDateString() === today.toDateString();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isDisabled ? 'disabled' : 'available'} ${isToday ? 'today' : ''}`}
          onClick={() => !isDisabled && handleDateClick(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="calendar">
      {debugInfo && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffeb3b',
          border: '2px solid #ff9800',
          borderRadius: '8px',
          marginBottom: '15px',
          fontFamily: 'monospace'
        }}>
          <strong>🔍 DEBUG:</strong> {debugInfo}
        </div>
      )}
      <div className="calendar-header">
        <button onClick={previousMonth} className="nav-button">
          &#8249;
        </button>
        <h3>
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button onClick={nextMonth} className="nav-button">
          &#8250;
        </button>
      </div>
      
      <div className="calendar-grid">
        <div className="day-names">
          {dayNames.map(name => (
            <div key={name} className="day-name">
              {name}
            </div>
          ))}
        </div>
        
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
        
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          TESTING - Calendar component loaded!
        </div>
      </div>
    </div>
  );
};

export default Calendar;