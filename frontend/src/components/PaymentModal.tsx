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
    Razorpay: {
      new (options: Record<string, unknown>): {
        open: () => void;
      };
    };
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
  
  const baseAmount = bookingData.duration * 1150;
  const discount = baseAmount - totalAmount;
  const hasDiscount = discount > 0;


  const createRazorpayOrder = async () => {
    try {
      console.log('Creating Razorpay order with amount:', totalAmount);
      
      const response = await fetch('/api/create-order', {
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
        const errorData = await response.text();
        console.error('Create order failed:', response.status, errorData);
        throw new Error(`Failed to create order: ${response.status} ${errorData}`);
      }

      const orderData = await response.json();
      console.log('Order created successfully:', orderData);
      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      console.log('Initiating payment with amount:', totalAmount);
      if (hasDiscount) {
        console.log('Discount applied:', discount);
      }

      // Create Razorpay order
      const orderData = await createRazorpayOrder();
      console.log('Razorpay order created:', orderData);
      
      const options = {
        key: 'rzp_live_e8b0gxbJekncVP',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Studio Booking',
        description: `Booking for ${bookingData.date} at ${bookingData.startTime}`,
        order_id: orderData.id,
        handler: async (response: Record<string, unknown>) => {
          console.log('Payment successful, response:', response);
          try {
            await confirmBooking(response, orderData.id);
          } catch (error) {
            setError('Payment successful but booking confirmation failed. Please contact support.');
            console.error('Booking confirmation error:', error);
          }
        },
        prefill: {
          name: bookingData.name,
          email: bookingData.email,
          contact: bookingData.phone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setProcessing(false);
            setError('Payment cancelled by user');
          },
          escape: false,
          backdropclose: false,
          handleback: true,
          confirm_close: true,
          callback: (response: any) => {
            console.log('Razorpay callback response:', response);
            if (response.error) {
              console.error('Razorpay error:', response.error);
              setError(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
              setProcessing(false);
            }
          }
        }
      };

      console.log('Razorpay options:', options);

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed event:', response);
          setError(`Payment failed: ${response.error.description || response.error.reason || 'Payment declined'}`);
          setProcessing(false);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to initiate payment: ${errorMessage}`);
      setProcessing(false);
    }
  };

  const confirmBooking = async (paymentResponse: Record<string, unknown>, orderId: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          originalAmount: baseAmount,
          discountAmount: discount,
          totalAmount: totalAmount,
          couponCode: null, // Coupon is handled in the parent component
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
            {hasDiscount && (
              <div className="summary-row">
                <span>Original Amount:</span>
                <span style={{ textDecoration: 'line-through' }}>₹{baseAmount}</span>
              </div>
            )}
            {hasDiscount && (
              <div className="summary-row">
                <span>Discount Applied:</span>
                <span style={{ color: '#28a745' }}>-₹{discount}</span>
              </div>
            )}
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