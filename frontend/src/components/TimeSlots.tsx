import React, { useState, useEffect } from 'react';

interface TimeSlotsProps {
  date: string;
  duration: number;
  onTimeSelect: (time: string) => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ date, duration, onTimeSelect }) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAvailableSlots();
  }, [date, duration]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/availability-date?date=${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      const filteredSlots = filterSlotsByDuration(data.availableSlots, duration);
      setAvailableSlots(filteredSlots);
    } catch (err) {
      setError('Failed to load available time slots');
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSlotsByDuration = (slots: string[], duration: number): string[] => {
    return slots.filter(slot => {
      const startHour = parseInt(slot.split(':')[0]);
      const endHour = startHour + duration;
      
      // Check if the booking would end before 9 PM (21:00)
      if (endHour > 21) return false;
      
      // Check if all consecutive slots are available
      for (let i = 1; i < duration; i++) {
        const nextHour = startHour + i;
        const nextSlot = `${nextHour.toString().padStart(2, '0')}:00`;
        if (!slots.includes(nextSlot)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':');
    const startHour = parseInt(hours);
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
    return formatTimeSlot(endTime);
  };

  if (loading) {
    return (
      <div className="time-slots loading">
        <p>Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-slots error">
        <p>{error}</p>
        <button onClick={fetchAvailableSlots} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="time-slots no-slots">
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#721c24', fontWeight: 'bold' }}>
            ❌ No Available Time Slots
          </p>
          <p style={{ margin: '0', color: '#721c24', fontSize: '14px' }}>
            All time slots for {duration} hour{duration > 1 ? 's' : ''} are booked on this date.
            Try selecting a shorter duration or different date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-slots">
      <div style={{ 
        marginBottom: '15px', 
        padding: '12px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '8px',
        border: '1px solid #c3e6cb'
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#155724' }}>
          ✅ <strong>Available Time Slots</strong> - Booked times are automatically filtered out to prevent double bookings
        </p>
      </div>

      <div className="slots-grid">
        {availableSlots.map((slot) => (
          <button
            key={slot}
            className="time-slot"
            onClick={() => onTimeSelect(slot)}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: '2px solid #20c997',
              color: 'white',
              boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
            }}
          >
            <div className="slot-time">
              {formatTimeSlot(slot)} - {getEndTime(slot, duration)}
            </div>
            <div className="slot-duration">
              {duration} hour{duration > 1 ? 's' : ''}
            </div>
            <div className="slot-price">
              ₹{duration * 1150}
            </div>
          </button>
        ))}
      </div>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        🕘 Studio Hours: 9:00 AM - 9:00 PM | All bookings must end by 9:00 PM
      </div>
    </div>
  );
};

export default TimeSlots;