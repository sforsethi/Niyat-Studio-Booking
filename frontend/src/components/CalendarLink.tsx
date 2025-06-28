import React from 'react';

interface CalendarLinkProps {
  name: string;
  email: string;
  date: string;
  startTime: string;
  duration: number;
}

const CalendarLink: React.FC<CalendarLinkProps> = ({ name, email, date, startTime, duration }) => {
  const createGoogleCalendarLink = () => {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));
    
    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startFormatted = formatDateTime(startDateTime);
    const endFormatted = formatDateTime(endDateTime);
    
    const eventDetails = {
      action: 'TEMPLATE',
      text: `Studio Booking - ${name}`,
      dates: `${startFormatted}/${endFormatted}`,
      details: `Studio booking confirmation for ${name} (${email}). Duration: ${duration} hours. Total: ₹${duration * 950}`,
      location: 'Studio Location', // You can update this with actual address
    };
    
    const params = new URLSearchParams(eventDetails);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const createAppleCalendarLink = () => {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 60 * 1000));
    
    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startFormatted = formatDateTime(startDateTime);
    const endFormatted = formatDateTime(endDateTime);
    
    const eventDetails = {
      action: 'TEMPLATE',
      text: `Studio Booking - ${name}`,
      dates: `${startFormatted}/${endFormatted}`,
      details: `Studio booking confirmation for ${name} (${email}). Duration: ${duration} hours. Total: ₹${duration * 950}`,
      location: 'Studio Location',
    };
    
    const params = new URLSearchParams(eventDetails);
    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:Studio Booking - ${name}
DESCRIPTION:Studio booking confirmation for ${name} (${email}). Duration: ${duration} hours. Total: ₹${duration * 950}
LOCATION:Studio Location
END:VEVENT
END:VCALENDAR`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '10px',
      border: '1px solid #e9ecef'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📅 Add to Calendar</h4>
      
      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        <strong>{formatDate(date)}</strong> at <strong>{formatTime(startTime)}</strong> ({duration} hour{duration > 1 ? 's' : ''})
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={createGoogleCalendarLink()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#4285f4',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📅 Add to Google Calendar
        </a>
        
        <a
          href={createAppleCalendarLink()}
          download="studio-booking.ics"
          style={{
            display: 'inline-block',
            background: '#007aff',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📱 Download .ics File
        </a>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        💡 Click the links above to automatically add this booking to your calendar
      </div>
    </div>
  );
};

export default CalendarLink;