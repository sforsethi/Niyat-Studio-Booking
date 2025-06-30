import React from 'react';

interface TermsAndConditionsProps {
  onClose: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '28px'
          }}>
            📋 Terms & Conditions
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            margin: 0
          }}>
            Niyat Studios - Complete Solution Studio Services
          </p>
        </div>

        <div style={{ 
          color: '#333',
          lineHeight: '1.6',
          fontSize: '15px'
        }}>

          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>📄 Studio Rental – Terms & Conditions</h3>
            <p style={{ margin: '0', color: '#1565c0', fontSize: '14px' }}>
              Thank you for choosing our studio for your creative and professional needs. 
              Please read the following terms and conditions carefully before making a booking.
            </p>
          </div>
          
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>1. Booking Confirmation</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>All bookings must be made in advance through our official website</li>
              <li>A booking is only confirmed once the full payment has been made through our online payment gateway</li>
              <li>Bookings without advance payment will not be held or considered confirmed</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>2. Booking Duration</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Clients may book the studio for a flexible number of hours depending on availability</li>
              <li>The total rental duration must be accurately selected at the time of booking</li>
              <li>Booking rates: ₹1,150 per hour (standard) | ₹999 per hour (4+ consecutive days)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>3. Cancellations & Rescheduling</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Cancellations made at least 24 hours prior to the scheduled booking time are eligible for rescheduling or a credit note</li>
              <li>Same-day cancellations or no-shows are non-refundable</li>
              <li>Rescheduling is subject to future availability and cannot be guaranteed</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>4. Studio Rules & Conduct</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Please arrive and vacate the studio within your reserved time slot</li>
              <li>Any overtime will be chargeable</li>
              <li>Clients are responsible for maintaining cleanliness and handling studio equipment and furniture with care</li>
              <li>Any damage to property will be chargeable to the client</li>
              <li>The studio must be returned to its original condition after use</li>
              <li>No smoking, alcohol, or illegal substances permitted</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>5. Guest Capacity</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Clients must accurately declare the number of people attending at the time of booking</li>
              <li>Bookings for group sessions, rehearsals, or events with more than 6 people are subject to specific usage guidelines and may require approval in advance</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>6. Payment Policy</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Full payment is required at the time of booking</li>
              <li>We do not accept on-the-spot payments</li>
              <li>Bookings will be automatically released if payment is not received in advance</li>
              <li>All payments processed securely through Razorpay</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>7. No Partial Refunds</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>No refunds will be issued for reduced usage once the booking is confirmed</li>
              <li>All payments are non-refundable within 24 hours of the booking time</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>8. Force Majeure</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>We are not liable for cancellations or delays caused by events beyond our control, including but not limited to natural disasters, government orders, power outages, or emergency situations</li>
              <li>In such cases, we will offer rescheduling wherever possible</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>9. Dispute Resolution</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Any disputes or concerns will be addressed by our team on a case-by-case basis</li>
              <li>The studio's decision in such matters will be final and binding</li>
              <li>Delhi jurisdiction applies for any legal matters</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>10. Acceptance of Terms</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>By booking the studio and making payment through our website, you agree to all the terms and conditions outlined above</li>
            </ul>
          </section>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #007bff',
            marginTop: '30px'
          }}>
            <h4 style={{ color: '#007bff', margin: '0 0 10px 0' }}>📍 Studio Address</h4>
            <p style={{ margin: '0', color: '#555' }}>
              H-1462, Ground Floor, Chittaranjan Park, New Delhi - 110019
            </p>
            
            <h4 style={{ color: '#007bff', margin: '15px 0 10px 0' }}>📩 For Assistance</h4>
            <p style={{ margin: '0', color: '#555' }}>
              Email: niyatstudios@gmail.com<br />
              Phone/WhatsApp: +91 8882379649
            </p>
            
            <p style={{ 
              margin: '15px 0 0 0', 
              fontSize: '14px', 
              color: '#666',
              fontStyle: 'italic' 
            }}>
              By booking our studio, you acknowledge that you have read, understood, 
              and agree to these terms and conditions.
            </p>
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ 
              margin: '0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Last Updated: December 2024 | © 2024 Niyat Studios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;