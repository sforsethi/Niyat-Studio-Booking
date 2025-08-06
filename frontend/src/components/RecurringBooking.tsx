import React, { useState } from 'react';

interface RecurringBookingProps {
  selectedDate: string;
  selectedTime: string;
  duration: number;
  onRecurringSelect: (recurringData: RecurringData) => void;
  onSkipRecurring: () => void;
}

export interface RecurringData {
  frequency: 'none' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: string;
  occurrences?: number;
  selectedDates?: string[];
  discountApplied?: boolean;
  originalPrice?: number;
  finalPrice?: number;
}

const RecurringBooking: React.FC<RecurringBookingProps> = ({
  selectedDate,
  selectedTime,
  duration,
  onRecurringSelect,
  onSkipRecurring
}) => {
  const [frequency, setFrequency] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [endType, setEndType] = useState<'date' | 'occurrences'>('occurrences');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState(4);

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

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const generateRecurringDates = () => {
    const dates: string[] = [];
    const startDate = new Date(selectedDate);
    let currentDate = new Date(startDate);
    
    const maxDates = endType === 'occurrences' ? occurrences : 52; // Max 1 year
    const endDateTime = endType === 'date' ? new Date(endDate) : null;

    for (let i = 0; i < maxDates; i++) {
      if (endDateTime && currentDate > endDateTime) break;
      
      dates.push(currentDate.toISOString().split('T')[0]);
      
      // Calculate next occurrence
      switch (frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }
    
    return dates;
  };

  const handleCreateRecurring = () => {
    const selectedDates = generateRecurringDates();
    const basePrice = selectedDates.length * duration * 1150; // Full price without any discounts
    const sessionDiscountPrice = selectedDates.length * duration * (selectedDates.length >= 4 ? 999 : 1150);
    
    // Apply additional 20% discount for recurring bookings (same as 4-week preset)
    const finalDiscountedPrice = Math.round(sessionDiscountPrice * 0.8);
    
    onRecurringSelect({
      frequency,
      endDate: endType === 'date' ? endDate : undefined,
      occurrences: endType === 'occurrences' ? occurrences : undefined,
      selectedDates,
      finalPrice: finalDiscountedPrice,
      originalPrice: basePrice,
      discountApplied: true // Always true for recurring bookings
    });
  };

  const recurringDates = generateRecurringDates();
  const basePrice = recurringDates.length * duration * 1150; // Full price without any discounts
  const sessionDiscountPrice = recurringDates.length * duration * (recurringDates.length >= 4 ? 999 : 1150);
  const finalDiscountedPrice = Math.round(sessionDiscountPrice * 0.8); // Apply 20% discount
  const totalSavings = basePrice - finalDiscountedPrice;

  return (
    <div className="step-content">
      <h2>🔄 Set Up Recurring Appointment</h2>
      
      <div className="booking-summary" style={{ marginBottom: '30px' }}>
        <h3>Base Appointment</h3>
        <p><strong>Date:</strong> {formatDate(selectedDate)} ({getDayOfWeek(selectedDate)})</p>
        <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
        <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
        <p><strong>Cost per session:</strong> ₹{Math.round((recurringDates.length >= 4 ? duration * 999 : duration * 1150) * 0.8)}</p>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '25px', 
        borderRadius: '10px',
        border: '2px solid #e9ecef',
        marginBottom: '25px'
      }}>
        <h3 style={{ marginTop: 0, color: '#495057' }}>Recurring Schedule</h3>
        
        <div className="form-group">
          <label htmlFor="frequency">Repeat Frequency:</label>
          <select 
            id="frequency"
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value as any)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="weekly">Every Week ({getDayOfWeek(selectedDate)}s)</option>
            <option value="biweekly">Every 2 Weeks ({getDayOfWeek(selectedDate)}s)</option>
            <option value="monthly">Every Month (same date)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>End Recurring Appointments:</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="occurrences"
                checked={endType === 'occurrences'}
                onChange={(e) => setEndType(e.target.value as any)}
              />
              After
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="date"
                checked={endType === 'date'}
                onChange={(e) => setEndType(e.target.value as any)}
              />
              On date
            </label>
          </div>
        </div>

        {endType === 'occurrences' && (
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="occurrences">Number of sessions:</label>
            <select 
              id="occurrences"
              value={occurrences} 
              onChange={(e) => setOccurrences(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 52].map(num => (
                <option key={num} value={num}>{num} sessions</option>
              ))}
            </select>
          </div>
        )}

        {endType === 'date' && (
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="endDate">End date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={selectedDate}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>
        )}
      </div>

      <div style={{ 
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #b8daff',
        marginBottom: '25px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#004085' }}>📅 Recurring Schedule Preview</h4>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto',
          background: 'white',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #cce7ff'
        }}>
          {recurringDates.slice(0, 10).map((date, index) => (
            <div key={date} style={{ 
              padding: '8px 0', 
              borderBottom: index < Math.min(9, recurringDates.length - 1) ? '1px solid #eee' : 'none',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span><strong>Session {index + 1}:</strong> {formatDate(date)}</span>
              <span style={{ color: '#666' }}>{formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</span>
            </div>
          ))}
          {recurringDates.length > 10 && (
            <div style={{ 
              padding: '10px 0', 
              textAlign: 'center', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              ... and {recurringDates.length - 10} more sessions
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '16px', fontWeight: 'bold', color: '#004085' }}>
          <p style={{ margin: '5px 0' }}>Total Sessions: {recurringDates.length}</p>
          
          {/* Show pricing breakdown with discounts */}
          <div style={{ margin: '10px 0', fontSize: '14px', fontWeight: 'normal' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
              <span>Regular Price:</span>
              <span style={{ textDecoration: 'line-through', color: '#999' }}>₹{basePrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', color: '#28a745' }}>
              <span>Recurring Discount (20%):</span>
              <span>-₹{totalSavings.toLocaleString()}</span>
            </div>
          </div>
          
          <p style={{ margin: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
            Final Price: ₹{finalDiscountedPrice.toLocaleString()}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', fontWeight: 'normal', color: '#28a745' }}>
            💰 You save ₹{totalSavings.toLocaleString()} with recurring booking!
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          onClick={handleCreateRecurring}
          className="submit-button"
          style={{ flex: 1, maxWidth: '250px' }}
        >
          📅 Book {recurringDates.length} Sessions - ₹{finalDiscountedPrice.toLocaleString()}
        </button>
        
        <button 
          onClick={onSkipRecurring}
          className="back-button"
          style={{ flex: 1, maxWidth: '200px' }}
        >
          📝 Single Session Only
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#fff3cd', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#856404'
      }}>
        <p style={{ margin: '0 0 10px 0' }}><strong>💡 Recurring Benefits:</strong></p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Guaranteed time slot every {frequency === 'weekly' ? 'week' : frequency === 'biweekly' ? '2 weeks' : 'month'}</li>
          <li>Same professional time: {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</li>
          <li>Consistent schedule for better habit building</li>
          <li>Easy management - modify or cancel all sessions at once</li>
        </ul>
      </div>
    </div>
  );
};

export default RecurringBooking;