import React, { useState } from 'react';
import Calendar from './components/Calendar';
import CalendarLink from './components/CalendarLink';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import ContactUs from './components/ContactUs';
import TermsAndConditions from './components/TermsAndConditions';
import RefundPolicy from './components/RefundPolicy';
import PrivacyPolicy from './components/PrivacyPolicy';
import PaymentModal from './components/PaymentModal';
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
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showRefund, setShowRefund] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
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
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponData, setCouponData] = useState<{
    valid: boolean;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    coupon: {
      code: string;
      description: string;
    };
    error?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

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

  const handleTimeSelect = async (time: string) => {
    try {
      // Check availability before allowing time selection
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          startTime: time,
          duration: duration
        }),
      });

      const result = await response.json();
      
      if (!result.available) {
        alert(`❌ Time Slot Unavailable\n\n${result.message}\n\nPlease choose a different time.`);
        return;
      }
      
      // Time is available, proceed
      setSelectedTime(time);
      if (bookingType === 'recurring') {
        setStep(3); // Go to recurring options
      } else {
        setStep(4); // Go directly to booking form for one-time
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Unable to verify availability. Please try again.');
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

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponData(null);
      setCouponError('');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      // Calculate the correct amount based on booking type
      const amount = (() => {
        if (isRecurring && recurringData && recurringData.finalPrice) {
          return recurringData.finalPrice;
        }
        return duration * 1150;
      })();
      
      // Fixed endpoint: validate-coupon (not simple-coupon)
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim(), amount }),
      });

      const data = await response.json();
      
      if (data.valid) {
        setCouponData(data);
        setCouponError('');
      } else {
        setCouponData(null);
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon');
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCouponCode(value);
  };

  const applyCoupon = () => {
    validateCoupon(couponCode);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Double-check availability before proceeding to payment
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedTime,
          duration: duration
        }),
      });

      const result = await response.json();
      
      if (!result.available) {
        alert(`❌ Time Slot No Longer Available\n\n${result.message}\n\nPlease go back and choose a different time.`);
        return;
      }
      
      // Show payment modal for proper Razorpay integration
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Unable to verify availability. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setStep(5); // Move to confirmation step
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
    setShowAdmin(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setShowAdmin(false);
  };

  const handleAdminButtonClick = () => {
    if (isAdminAuthenticated) {
      setShowAdmin(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const formatDateDisplay = (dateString: string) => {
    // Create date in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatShortDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeekday = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Show admin panel (only if authenticated)
  if (showAdmin && isAdminAuthenticated) {
    return <AdminPanel onBack={handleAdminLogout} />;
  }

  // Show contact us modal
  if (showContact) {
    return <ContactUs onClose={() => setShowContact(false)} />;
  }

  // Show terms and conditions modal
  if (showTerms) {
    return <TermsAndConditions onClose={() => setShowTerms(false)} />;
  }

  // Show refund policy modal
  if (showRefund) {
    return <RefundPolicy onClose={() => setShowRefund(false)} />;
  }

  // Show privacy policy modal
  if (showPrivacy) {
    return <PrivacyPolicy onClose={() => setShowPrivacy(false)} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
          <div>
            <h1>Niyat Studios</h1>
            <p>Book your studio time at ₹1150 per hour</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowContact(true)}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#0056b3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#007bff';
              }}
            >
              📞 Contact Us
            </button>
            <button
              onClick={handleAdminButtonClick}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#5a6268';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#6c757d';
              }}
            >
              📊 Admin Panel
            </button>
          </div>
        </div>
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
                      {hours} hour{hours > 1 ? 's' : ''} - ₹{hours * 1150}
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
                      ₹{duration * 1150}
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
                <p><strong>Selected Day:</strong> {formatDateDisplay(selectedDate)}</p>
                <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                <p><strong>Cost per session:</strong> ₹{duration * 1150}</p>
              </div>

              <div style={{ 
                background: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '10px',
                border: '2px solid #e9ecef',
                marginBottom: '25px'
              }}>
                <h3 style={{ marginTop: 0, color: '#495057' }}>📅 Book Next 4 {getWeekday(selectedDate)}s</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                  Book the next 4 {getWeekday(selectedDate)}s starting from {formatShortDate(selectedDate)} at the same time
                </p>
                
                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                  {(() => {
                    const [year, month, day] = selectedDate.split('-');
                    const selectedDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    
                    // Find next 4 weeks starting from selected date (including the selected date)
                    const weeklyDates: Date[] = [];
                    for (let i = 0; i < 4; i++) {
                      const nextWeek = new Date(selectedDay);
                      nextWeek.setDate(selectedDay.getDate() + (i * 7));
                      weeklyDates.push(nextWeek);
                    }
                    
                    const sessionsCount = 4; // Always 4 sessions for next 4 weeks
                    const regularPrice = sessionsCount * duration * 1150; // Regular price without discount
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
                            <p style={{ margin: '2px 0' }}>📆 Every {getWeekday(selectedDate)} for 4 weeks</p>
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
                  <li>📅 Same time every {getWeekday(selectedDate)}</li>
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
                    <p><strong>Booking Type:</strong> Weekly Recurring (Next 4 {getWeekday(selectedDate)}s)</p>
                    <p><strong>Total Sessions:</strong> {recurringData.selectedDates?.length || 0}</p>
                    <p><strong>Dates:</strong> {recurringData.selectedDates?.map(date => 
                      formatShortDate(date)
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
                    <p><strong>Date:</strong> {formatDateDisplay(selectedDate)}</p>
                    <p><strong>Time:</strong> {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + duration}:00`)}</p>
                    <p><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</p>
                    
                    {couponData ? (
                      <div style={{ padding: '15px', background: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                          <span>Original Price:</span>
                          <span style={{ textDecoration: 'line-through' }}>₹{couponData.originalAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745' }}>
                          <span>Discount ({couponData.coupon.code}):</span>
                          <span>-₹{couponData.discountAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#28a745', marginTop: '8px' }}>
                          <span>Total Amount:</span>
                          <span>₹{couponData.finalAmount.toLocaleString()}</span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#28a745' }}>
                          💰 You saved ₹{couponData.discountAmount.toLocaleString()} with coupon {couponData.coupon.code}!
                        </p>
                      </div>
                    ) : (
                      <p style={{fontSize: '18px', fontWeight: 'bold', color: '#28a745'}}>
                        <strong>Total Amount:</strong> ₹{(duration * 1150).toLocaleString()}
                      </p>
                    )}
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

                {/* Coupon Code Section */}
                <div className="form-group coupon-section">
                  <label htmlFor="coupon" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎟️ Have a Coupon Code?
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>(Optional)</span>
                  </label>
                  
                  {!couponData ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ flex: '1' }}>
                        <input
                          type="text"
                          id="coupon"
                          value={couponCode}
                          onChange={handleCouponChange}
                          placeholder="Enter coupon code"
                          style={{
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}
                        />
                        {couponError && (
                          <p style={{ 
                            color: '#dc3545', 
                            fontSize: '12px', 
                            margin: '5px 0 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ❌ {couponError}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        style={{
                          background: validatingCoupon ? '#6c757d' : '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '5px',
                          cursor: validatingCoupon || !couponCode.trim() ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          minWidth: '80px'
                        }}
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      background: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '5px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#155724', fontWeight: 'bold', fontSize: '14px' }}>
                          ✅ Coupon Applied: {couponData.coupon.code}
                        </div>
                        <div style={{ color: '#155724', fontSize: '12px', marginTop: '2px' }}>
                          {couponData.coupon.description}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{
                          background: 'transparent',
                          border: '1px solid #155724',
                          color: '#155724',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#666', 
                    marginTop: '8px',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    💡 <strong>Info:</strong> Apply coupon codes here for discounts (if available)
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    {isRecurring && recurringData ? 
                      `Confirm Booking - Pay ₹${recurringData.finalPrice?.toLocaleString()}` :
                      `Confirm Booking - Pay ₹${couponData ? couponData.finalAmount.toLocaleString() : (duration * 1150).toLocaleString()}`
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
                    <p><strong>Booking Type:</strong> Weekly Recurring (Next 4 {getWeekday(selectedDate)}s)</p>
                    <p><strong>Total Sessions:</strong> {recurringData.selectedDates?.length || 0}</p>
                    <p><strong>Dates:</strong> {recurringData.selectedDates?.map(date => 
                      formatShortDate(date)
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
                    <p><strong>Total Paid:</strong> ₹{duration * 1150}</p>
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
                <p><strong>📞 Questions?</strong> Contact us at niyatstudios@gmail.com or call +91 8882379649</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer style={{
        background: '#343a40',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>🎵 Niyat Studios</h3>
              <p style={{ margin: '0', color: '#adb5bd', lineHeight: '1.6' }}>
                A complete solution studio for<br />
                🌺 Influencer shoots<br />
                🌺 Dance & Fitness classes<br />
                🌺 Videography<br />
                🌺 And much more
              </p>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '15px', color: '#fff' }}>📞 Contact Info</h4>
              <div style={{ color: '#adb5bd', lineHeight: '1.8' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Phone:</strong> <a href="tel:+918882379649" style={{ color: '#17a2b8', textDecoration: 'none' }}>+91 8882379649</a>
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Email:</strong> <a href="mailto:niyatstudios@gmail.com" style={{ color: '#17a2b8', textDecoration: 'none' }}>niyatstudios@gmail.com</a>
                </p>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '15px', color: '#fff' }}>📍 Studio Address</h4>
              <p style={{ margin: '0', color: '#adb5bd', lineHeight: '1.6' }}>
                H-1462, Ground Floor<br />
                Chittaranjan Park<br />
                New Delhi - 110019
              </p>
              <a
                href="https://maps.app.goo.gl/jCD5mJ9QvnsPfr9V8"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#17a2b8',
                  textDecoration: 'none',
                  fontSize: '14px',
                  marginTop: '10px',
                  display: 'inline-block'
                }}
              >
                📍 View on Maps
              </a>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #495057',
            paddingTop: '20px',
            color: '#adb5bd',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              © 2024 Niyat Studios. All rights reserved. | Professional Recording Studio Services
            </p>
            <p style={{ margin: '0' }}>
              <button
                onClick={() => setShowTerms(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#17a2b8',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Terms & Conditions
              </button>
              {' | '}
              <button
                onClick={() => setShowRefund(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#17a2b8',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Refund Policy
              </button>
              {' | '}
              <button
                onClick={() => setShowPrivacy(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#17a2b8',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bookingData={{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: selectedDate,
            startTime: selectedTime,
            duration: duration,
            recurringData: recurringData || undefined,
            isRecurring: isRecurring
          }}
          totalAmount={(() => {
            if (isRecurring && recurringData && recurringData.finalPrice) {
              // Use the pre-calculated final price from recurring data
              return couponData ? couponData.finalAmount : recurringData.finalPrice;
            }
            return couponData ? couponData.finalAmount : duration * 1150;
          })()}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default App;