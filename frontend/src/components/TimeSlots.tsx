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
      
      const response = await fetch(`http://localhost:5002/api/availability/${date}`);
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
        <p>No available time slots for {duration} hour{duration > 1 ? 's' : ''} on this date.</p>
        <p>Try selecting a different duration or date.</p>
      </div>
    );
  }

  return (
    <div className="time-slots">
      <div className="slots-grid">
        {availableSlots.map((slot) => (
          <button
            key={slot}
            className="time-slot"
            onClick={() => onTimeSelect(slot)}
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
    </div>
  );
};

export default TimeSlots;