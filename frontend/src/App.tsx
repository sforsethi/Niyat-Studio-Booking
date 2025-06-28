import React, { useState } from 'react';
import Calendar from './components/Calendar';
import CalendarLink from './components/CalendarLink';
import './App.css';

// RecurringData type definition with discount support
interface RecurringData {
  frequency: 'none' | 'weekly' | 'biweekly' | 'monthly' | 'monthly-weekly';
  endDate?: string;
  occurrences?: number;
  selectedDates?: string[];
  discountApplied?: boolean;
  originalPrice?: number;
  finalPrice?: number;
}

function App() {
  const [step, setStep] = useState<number>(0); // Start at 0 for booking type selection
  const [bookingType, setBookingType] = useState<'onetime' | 'recurring' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringData, setRecurringData] = useState<RecurringData | null>(null);

  // Available time slots (professional studio hours)
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const handleBookingTypeSelect = (type: 'onetime' | 'recurring') => {
    setBookingType(type);
    setIsRecurring(type === 'recurring');
    setStep(1);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (bookingType === 'recurring') {
      setStep(3); // Go to recurring options
    } else {
      setStep(4); // Go directly to booking form for one-time
    }
  };

  const handleRecurringSelect = (data: RecurringData) => {
    setRecurringData(data);
    setIsRecurring(true);
    setStep(4); // Go to booking form
  };

  const handleSkipRecurring = () => {
    setIsRecurring(false);
    setRecurringData(null);
    setStep(4); // Go to booking form
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message and move to confirmation step
    setStep(5);
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
          {/* Progress Steps - Only show after booking type is selected */}
          {step > 0 && (
            <div className="booking-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-title">Select Date</span>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-title">Choose Time</span>
              </div>
              {bookingType === 'recurring' && (
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-title">Recurring</span>
                </div>
              )}
              <div className={`step ${step >= 4 ? 'active' : ''}`}>
                <span className="step-number">{bookingType === 'recurring' ? '4' : '3'}</span>
                <span className="step-title">Book & Pay</span>
              </div>
              <div className={`step ${step >= 5 ? 'active' : ''}`}>
                <span className="step-number">✓</span>
                <span className="step-title">Confirmed</span>
              </div>
            </div>
          )}

          {/* Step 0: Booking Type Selection */}
          {step === 0 && (
            <div className="step-content">
              <h2>How would you like to book?</h2>
              <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666' }}>
                Choose your booking preference
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '30px', 
                maxWidth: '600px', 
                margin: '0 auto' 
              }}>
                <button
                  onClick={() => handleBookingTypeSelect('onetime')}
                  style={{
                    padding: '40px 30px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e1e5e9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>One-time Booking</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    Book a single studio session
                  </p>
                </button>

                <button
                  onClick={() => handleBookingTypeSelect('recurring')}
                  style={{
                    padding: '40px 30px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#28a745';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e1e5e9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔄</div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Recurring Booking</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    Book regular weekly/monthly sessions
                  </p>
                </button>
              </div>
            </div>
          )}

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
                  style={{
                    color: '#333',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                    <option key={hours} value={hours} style={{ color: '#333' }}>
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

          {/* Step 3: Recurring Options (only for recurring bookings) */}
          {step === 3 && bookingType === 'recurring' && (
            <div className="step-content">
              <h2>🔄 Weekly Recurring Booking</h2>
              
              <div className="booking-summary" style={{ marginBottom: '30px' }}>
                <h3>Base Session Details</h3>
                <p><strong>Selected Day:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                <p><strong>Cost per session:</strong> ₹{duration * 950}</p>
              </div>

              <div style={{ 
                background: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '10px',
                border: '2px solid #e9ecef',
                marginBottom: '25px'
              }}>
                <h3 style={{ marginTop: 0, color: '#495057' }}>📅 Book Next 4 {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                  Book the next 4 {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s starting from {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at the same time
                </p>
                
                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                  {(() => {
                    const selectedDay = new Date(selectedDate);
                    
                    // Find next 4 weeks starting from selected date (including the selected date)
                    const weeklyDates: Date[] = [];
                    for (let i = 0; i < 4; i++) {
                      const nextWeek = new Date(selectedDay);
                      nextWeek.setDate(selectedDay.getDate() + (i * 7));
                      weeklyDates.push(nextWeek);
                    }
                    
                    const sessionsCount = 4; // Always 4 sessions for next 4 weeks
                    const regularPrice = sessionsCount * duration * 950;
                    const hasDiscount = true; // Always 4 sessions, so always discount
                    const discountedPrice = Math.round(regularPrice * 0.8);
                    const savings = regularPrice - discountedPrice;
                    
                    return (
                      <div>
                        <div style={{
                          padding: '20px',
                          background: hasDiscount ? '#e8f5e8' : 'white',
                          border: hasDiscount ? '2px solid #28a745' : '1px solid #ddd',
                          borderRadius: '8px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '18px', color: '#333' }}>
                              📅 4 Weekly Sessions
                            </strong>
                            <span style={{
                              background: '#28a745',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              20% OFF
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            <p style={{ margin: '2px 0' }}>📍 Dates: {weeklyDates.map(d => 
                              `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            ).join(', ')}</p>
                            <p style={{ margin: '2px 0' }}>⏰ Time: {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)} (all sessions)</p>
                            <p style={{ margin: '2px 0' }}>⌛ Duration: {duration} hour{duration > 1 ? 's' : ''} per session</p>
                            <p style={{ margin: '2px 0' }}>📆 Every {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })} for 4 weeks</p>
                          </div>
                          
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            {hasDiscount ? (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                                  <span>Regular Price:</span>
                                  <span style={{ textDecoration: 'line-through' }}>₹{regularPrice.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745' }}>
                                  <span>Discount (20%):</span>
                                  <span>-₹{savings.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#28a745', marginTop: '8px' }}>
                                  <span>Total Price:</span>
                                  <span>₹{discountedPrice.toLocaleString()}</span>
                                </div>
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#28a745' }}>
                                  💰 You save ₹{savings.toLocaleString()} with monthly booking!
                                </p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                <span>Total Price:</span>
                                <span>₹{regularPrice.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              const recurringData: RecurringData = {
                                frequency: 'weekly',
                                occurrences: sessionsCount,
                                selectedDates: weeklyDates.map(d => d.toISOString().split('T')[0]),
                                discountApplied: hasDiscount,
                                originalPrice: regularPrice,
                                finalPrice: discountedPrice
                              };
                              handleRecurringSelect(recurringData);
                            }}
                            style={{
                              width: '100%',
                              padding: '15px',
                              background: hasDiscount ? '#28a745' : '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              marginTop: '15px'
                            }}
                          >
                            🎯 Book All 4 Sessions - ₹{discountedPrice.toLocaleString()}
                            <span style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
                              (Save ₹{savings.toLocaleString()})
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div style={{ 
                background: '#fff3cd', 
                padding: '15px', 
                borderRadius: '8px',
                fontSize: '14px',
                color: '#856404',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>💡 Weekly Recurring Benefits:</strong></p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>🎯 Guaranteed studio time for 4 consecutive weeks</li>
                  <li>💰 20% discount on 4-week package</li>
                  <li>📅 Same time every {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</li>
                  <li>✅ Easy to maintain consistent routine</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button 
                  onClick={handleSkipRecurring}
                  className="back-button"
                  style={{ flex: 1, maxWidth: '200px' }}
                >
                  📝 Single Session Only
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Booking Form */}
          {step === 4 && (
            <div className="step-content">
              <h2>Complete Your Booking</h2>
              
              <div className="booking-summary">
                <h3>📅 Booking Summary</h3>
                {isRecurring && recurringData ? (
                  <>
                    <p><strong>Booking Type:</strong> Weekly Recurring (Next 4 {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s)</p>
                    <p><strong>Total Sessions:</strong> {recurringData.selectedDates?.length || 0}</p>
                    <p><strong>Dates:</strong> {recurringData.selectedDates?.map(date => 
                      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ).join(', ')}</p>
                    <p><strong>Time (all sessions):</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                    <p><strong>Duration per session:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                    
                    {recurringData.discountApplied ? (
                      <div style={{ padding: '15px', background: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                          <span>Regular Price:</span>
                          <span style={{ textDecoration: 'line-through' }}>₹{recurringData.originalPrice?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745' }}>
                          <span>Discount (20%):</span>
                          <span>-₹{((recurringData.originalPrice || 0) - (recurringData.finalPrice || 0)).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#28a745', marginTop: '8px' }}>
                          <span>Total Amount:</span>
                          <span>₹{recurringData.finalPrice?.toLocaleString()}</span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#28a745' }}>
                          💰 You saved ₹{((recurringData.originalPrice || 0) - (recurringData.finalPrice || 0)).toLocaleString()} with monthly booking!
                        </p>
                      </div>
                    ) : (
                      <p style={{fontSize: '18px', fontWeight: 'bold', color: '#28a745'}}>
                        <strong>Total Amount:</strong> ₹{recurringData.finalPrice?.toLocaleString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p><strong>Date:</strong> {selectedDate}</p>
                    <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                    <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                    <p><strong>Total Amount:</strong> ₹{duration * 950}</p>
                  </>
                )}
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
                    {isRecurring && recurringData ? 
                      `Confirm Booking - Pay ₹${recurringData.finalPrice?.toLocaleString()}` :
                      `Confirm Booking - Pay ₹${duration * 950}`
                    }
                  </button>
                </div>
              </form>

              <button onClick={() => bookingType === 'recurring' ? setStep(3) : setStep(2)} className="back-button">
                {bookingType === 'recurring' ? 'Back to Recurring Options' : 'Back to Time Selection'}
              </button>
            </div>
          )}


          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="step-content">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Booking Confirmed!</h2>
                <p style={{ fontSize: '18px', color: '#666' }}>Thank you for booking with us!</p>
              </div>

              <div className="booking-summary">
                <h3>✅ {isRecurring ? 'Recurring Booking' : 'Single Booking'} Confirmed</h3>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                
                {isRecurring && recurringData ? (
                  <>
                    <p><strong>Booking Type:</strong> Weekly Recurring (Next 4 {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s)</p>
                    <p><strong>Total Sessions:</strong> {recurringData.selectedDates?.length || 0}</p>
                    <p><strong>Dates:</strong> {recurringData.selectedDates?.map(date => 
                      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ).join(', ')}</p>
                    <p><strong>Time (all sessions):</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                    <p><strong>Duration per session:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                    
                    {recurringData.discountApplied ? (
                      <div style={{ padding: '10px', background: '#e8f5e8', borderRadius: '5px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Regular Price:</span>
                          <span style={{ textDecoration: 'line-through' }}>₹{recurringData.originalPrice?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745' }}>
                          <span>Monthly Discount (20%):</span>
                          <span>-₹{((recurringData.originalPrice || 0) - (recurringData.finalPrice || 0)).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#28a745', marginTop: '5px', borderTop: '1px solid #28a745', paddingTop: '5px' }}>
                          <span>Total Paid:</span>
                          <span>₹{recurringData.finalPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p style={{fontSize: '18px', fontWeight: 'bold', color: '#28a745'}}>
                        <strong>Total Paid:</strong> ₹{recurringData.finalPrice?.toLocaleString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p><strong>Date:</strong> {selectedDate}</p>
                    <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                    <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                    <p><strong>Total Paid:</strong> ₹{duration * 950}</p>
                  </>
                )}
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
                    setStep(0);
                    setBookingType(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setDuration(1);
                    setFormData({ name: '', email: '', phone: '' });
                    setRecurringData(null);
                    setIsRecurring(false);
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