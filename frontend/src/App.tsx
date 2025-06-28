import React, { useState } from 'react';
import Calendar from './components/Calendar';
import CalendarLink from './components/CalendarLink';
import './App.css';

function App() {
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Available time slots (professional studio hours)
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message and move to confirmation step
    setStep(4);
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

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
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <span className="step-number">✓</span>
              <span className="step-title">Confirmed</span>
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
          {step === 2 && (
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

              <div className="slots-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    className="time-slot"
                    onClick={() => handleTimeSelect(slot)}
                  >
                    <div className="slot-time">
                      {formatTime(slot)} - {formatTime(`${parseInt(slot.split(':')[0]) + duration}:00`)}
                    </div>
                    <div className="slot-duration">
                      {duration} hour{duration > 1 ? 's' : ''}
                    </div>
                    <div className="slot-price">
                      ₹{duration * 950}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="back-button">
                Back to Date Selection
              </button>
            </div>
          )}

          {/* Step 3: Booking Form */}
          {step === 3 && (
            <div className="step-content">
              <h2>Complete Your Booking</h2>
              
              <div className="booking-summary">
                <h3>📅 Booking Summary</h3>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                <p><strong>Total Amount:</strong> ₹{duration * 950}</p>
              </div>

              <form onSubmit={handleFormSubmit} className="booking-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Confirm Booking - Pay ₹{duration * 950}
                  </button>
                </div>
              </form>

              <button onClick={() => setStep(2)} className="back-button">
                Back to Time Selection
              </button>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="step-content">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Booking Confirmed!</h2>
                <p style={{ fontSize: '18px', color: '#666' }}>Thank you for booking with us!</p>
              </div>

              <div className="booking-summary">
                <h3>✅ Booking Confirmed</h3>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                <p><strong>Total Paid:</strong> ₹{duration * 950}</p>
              </div>

              <CalendarLink
                name={formData.name}
                email={formData.email}
                date={selectedDate}
                startTime={selectedTime}
                duration={duration}
              />

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button 
                  onClick={() => {
                    setStep(1);
                    setSelectedDate('');
                    setSelectedTime('');
                    setDuration(1);
                    setFormData({ name: '', email: '', phone: '' });
                  }} 
                  className="submit-button"
                >
                  📝 Make Another Booking
                </button>
              </div>

              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#e9f7ef', 
                borderRadius: '8px',
                fontSize: '14px',
                color: '#155724'
              }}>
                <p><strong>📧 Confirmation sent!</strong> You will receive an email confirmation shortly.</p>
                <p><strong>📞 Questions?</strong> Contact us at studio@example.com or call (555) 123-4567</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;