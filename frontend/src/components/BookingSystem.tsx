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

  const totalAmount = duration * 950;

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