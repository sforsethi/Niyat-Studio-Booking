import React, { useState } from 'react';
import { BookingData } from './BookingSystem';

interface PaymentModalProps {
  bookingData: BookingData;
  totalAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingData,
  totalAmount,
  onSuccess,
  onClose
}) => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      // Temporarily bypass payment and create booking directly
      const response = await fetch('http://localhost:5002/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          totalAmount,
          razorpayOrderId: 'temp_order_' + Date.now(),
          razorpayPaymentId: 'temp_payment_' + Date.now(),
          razorpaySignature: 'temp_signature',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Booking confirmed successfully! (Payment bypassed for testing)');
        onSuccess();
      } else {
        throw new Error(result.message || 'Booking confirmation failed');
      }
    } catch (error) {
      setError('Failed to create booking. Please try again.');
      setProcessing(false);
    }
  };

  const confirmBooking = async (paymentResponse: any, orderId: string) => {
    try {
      const response = await fetch('http://localhost:5002/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Booking confirmed successfully! You will receive a confirmation email shortly.');
        onSuccess();
      } else {
        throw new Error(result.message || 'Booking confirmation failed');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Complete Payment</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="summary-row">
              <span>Date:</span>
              <span>{bookingData.date}</span>
            </div>
            <div className="summary-row">
              <span>Time:</span>
              <span>{bookingData.startTime}</span>
            </div>
            <div className="summary-row">
              <span>Duration:</span>
              <span>{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
            </div>
            <div className="summary-row">
              <span>Name:</span>
              <span>{bookingData.name}</span>
            </div>
            <div className="summary-row">
              <span>Email:</span>
              <span>{bookingData.email}</span>
            </div>
            <div className="summary-row">
              <span>Phone:</span>
              <span>{bookingData.phone}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="payment-actions">
            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="payment-info">
            <p>💳 Secure payment powered by Razorpay</p>
            <p>📧 Confirmation will be sent to your email</p>
            <p>📅 Event will be added to Google Calendar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;