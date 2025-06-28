import React, { useState } from 'react';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import './App.css';

export interface BookingData {
  date: string;
  startTime: string;
  duration: number;
  name: string;
  email: string;
  phone: string;
}

function App() {
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

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
    // For now, just show success message
    alert(`Booking created! ${booking.name} - ${booking.date} at ${booking.startTime} for ${booking.duration} hours. Total: ₹${duration * 950}`);
  };

  const resetBooking = () => {
    setSelectedDate('');
    setSelectedTime('');
    setDuration(1);
    setBookingData(null);
    setStep(1);
  };

  const totalAmount = duration * 950;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Studio Booking System</h1>
        <p>Book your studio time at ₹950 per hour</p>
      </header>
      
      <main>
        <div className="booking-system">
          {/* Progress Steps */}
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

          {/* Step 1: Date Selection */}
          {step === 1 && (
            <div className="step-content">
              <h2>Select a Date</h2>
              <Calendar onDateSelect={handleDateSelect} />
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && selectedDate && (
            <div className="step-content">
              <h2>Available Time Slots - {selectedDate}</h2>
              <div className="duration-selector">
                <label htmlFor="duration">Duration (hours):</label>
                <select 
                  id="duration"
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} hour{hours > 1 ? 's' : ''} - ₹{hours * 950}
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

          {/* Step 3: Booking Form */}
          {step === 3 && selectedDate && selectedTime && (
            <div className="step-content">
              <h2>Complete Your Booking</h2>
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
              </div>
              <BookingForm onSubmit={handleBookingSubmit} />
              <button onClick={() => setStep(2)} className="back-button">
                Back to Time Selection
              </button>
              <button onClick={resetBooking} className="back-button" style={{marginLeft: '10px'}}>
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;