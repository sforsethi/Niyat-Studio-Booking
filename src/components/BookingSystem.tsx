import React, { useState } from 'react';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import BookingForm from './BookingForm';
import PaymentModal from './PaymentModal';

export interface BookingData {
  date: string;
  startTime: string;
  duration: number;
  name: string;
  email: string;
  phone: string;
}

const BookingSystem: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  const formatDisplayDate = (dateString: string) => {
    // Parse the date string manually
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);
    
    console.log('🟡 FORMAT DISPLAY DATE - Input:', dateString);
    console.log('🟡 FORMAT DISPLAY DATE - Parsed:', { year, month, day });
    
    // Month names array
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Calculate day of week using Zeller's congruence (no Date object)
    let m = month;
    let y = year;
    if (month < 3) {
      m += 12;
      y -= 1;
    }
    const k = y % 100;
    const j = Math.floor(y / 100);
    const dayOfWeek = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7;
    const adjustedDayOfWeek = ((dayOfWeek + 6) % 7); // Convert to 0=Sunday format
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[adjustedDayOfWeek];
    
    const formatted = `${dayName}, ${monthNames[month - 1]} ${day}, ${year}`;
    console.log('🟡 FORMAT DISPLAY DATE - Final formatted:', formatted);
    
    return formatted;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBookingSubmit = (formData: Omit<BookingData, 'date' | 'startTime' | 'duration'>) => {
    const booking: BookingData = {
      ...formData,
      date: selectedDate,
      startTime: selectedTime,
      duration: duration
    };
    setBookingData(booking);
    setShowPayment(true);
  };

  const resetBooking = () => {
    setSelectedDate('');
    setSelectedTime('');
    setDuration(1);
    setBookingData(null);
    setShowPayment(false);
    setStep(1);
  };

  const totalAmount = duration * 1150;

  return (
    <div className="booking-system">
      <div className="booking-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-title">Select Date</span>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-title">Choose Time</span>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-title">Book & Pay</span>
        </div>
      </div>

      {step === 1 && (
        <div className="step-content">
          <h2>Select a Date</h2>
          <Calendar onDateSelect={handleDateSelect} />
        </div>
      )}

      {step === 2 && selectedDate && (
        <div className="step-content">
          <h2>Available Time Slots - {formatDisplayDate(selectedDate)}</h2>
          <div style={{padding: '15px', backgroundColor: '#e8f4f8', marginBottom: '15px', border: '2px solid #007bff', borderRadius: '8px'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#007bff'}}>🔍 DEBUG INFORMATION</h3>
            <div style={{fontFamily: 'monospace', fontSize: '14px'}}>
              <p><strong>Raw date from Calendar:</strong> {selectedDate}</p>
              <p><strong>Formatted for display:</strong> {formatDisplayDate(selectedDate)}</p>
              <p><strong>Date parts:</strong> {(() => {
                const [y, m, d] = selectedDate.split('-');
                return `Year: ${y}, Month: ${m}, Day: ${d}`;
              })()}</p>
            </div>
          </div>
          <div className="duration-selector">
            <label htmlFor="duration">Duration (hours):</label>
            <select 
              id="duration"
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                <option key={hours} value={hours}>
                  {hours} hour{hours > 1 ? 's' : ''} - ₹{hours * 1150}
                </option>
              ))}
            </select>
          </div>
          <TimeSlots 
            date={selectedDate} 
            duration={duration}
            onTimeSelect={handleTimeSelect}
          />
          <button onClick={() => setStep(1)} className="back-button">
            Back to Date Selection
          </button>
        </div>
      )}

      {step === 3 && selectedDate && selectedTime && (
        <div className="step-content">
          <h2>Complete Your Booking</h2>
          <div style={{padding: '15px', backgroundColor: '#f8f9fa', marginBottom: '15px', border: '2px solid #28a745', borderRadius: '8px'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#28a745'}}>🔍 DEBUG INFORMATION (Step 3)</h3>
            <div style={{fontFamily: 'monospace', fontSize: '14px'}}>
              <p><strong>Raw date:</strong> {selectedDate}</p>
              <p><strong>Formatted date:</strong> {formatDisplayDate(selectedDate)}</p>
            </div>
          </div>
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <p><strong>Date:</strong> {formatDisplayDate(selectedDate)}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
          </div>
          <BookingForm onSubmit={handleBookingSubmit} />
          <button onClick={() => setStep(2)} className="back-button">
            Back to Time Selection
          </button>
        </div>
      )}

      {showPayment && bookingData && (
        <PaymentModal
          bookingData={bookingData}
          totalAmount={totalAmount}
          onSuccess={resetBooking}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default BookingSystem;