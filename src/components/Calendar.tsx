import React, { useState } from 'react';

interface CalendarProps {
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
      const dateString = selectedDate.toISOString().split('T')[0];
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
      </div>
    </div>
  );
};

export default Calendar;