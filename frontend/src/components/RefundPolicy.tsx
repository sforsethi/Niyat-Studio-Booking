import React from 'react';

interface RefundPolicyProps {
  onClose: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onClose }) => {
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
        maxWidth: '700px',
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
            💰 Refund & Cancellation Policy
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            margin: 0
          }}>
            Niyat Studios - Clear and Fair Policies
          </p>
        </div>

        <div style={{ 
          color: '#333',
          lineHeight: '1.6',
          fontSize: '15px'
        }}>
          
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#dc3545', marginBottom: '15px', fontSize: '20px' }}>⏰ Cancellation Policy</h3>
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '20px',
              borderRadius: '8px',
              borderLeft: '4px solid #ffc107',
              marginBottom: '15px'
            }}>
              <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Important Notice</h4>
              <p style={{ margin: '0', color: '#856404', fontWeight: 'bold' }}>
                Cancellations are ONLY allowed at least 24 hours before your scheduled booking time.
              </p>
            </div>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>24+ Hours Notice:</strong> Cancellation permitted with applicable refund</li>
              <li><strong>Less than 24 Hours:</strong> Cancellation NOT allowed - No refund</li>
              <li><strong>No-Show:</strong> Full session charge applies - No refund</li>
              <li><strong>Late Arrival:</strong> Session time will be reduced - No extension or refund</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#28a745', marginBottom: '15px', fontSize: '20px' }}>💸 Refund Structure</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#d4edda',
                borderRadius: '8px',
                border: '1px solid #c3e6cb'
              }}>
                <h4 style={{ color: '#155724', margin: '0 0 8px 0' }}>✅ 48+ Hours Before Session</h4>
                <p style={{ margin: '0', color: '#155724' }}>
                  <strong>100% Full Refund</strong> - Processed within 5-7 business days
                </p>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <h4 style={{ color: '#856404', margin: '0 0 8px 0' }}>⚠️ 24-48 Hours Before Session</h4>
                <p style={{ margin: '0', color: '#856404' }}>
                  <strong>50% Partial Refund</strong> - Administrative charges apply
                </p>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                <h4 style={{ color: '#721c24', margin: '0 0 8px 0' }}>❌ Less than 24 Hours</h4>
                <p style={{ margin: '0', color: '#721c24' }}>
                  <strong>No Refund</strong> - Cancellation not permitted
                </p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px', fontSize: '20px' }}>🔄 Rescheduling Policy</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>48+ Hours Notice:</strong> Free rescheduling to any available slot</li>
              <li><strong>24-48 Hours Notice:</strong> One-time rescheduling with ₹200 fee</li>
              <li><strong>Less than 24 Hours:</strong> Rescheduling not allowed</li>
              <li><strong>Studio Cancellation:</strong> Free rescheduling or full refund</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#6f42c1', marginBottom: '15px', fontSize: '20px' }}>⚡ Emergency Situations</h3>
            <div style={{
              backgroundColor: '#e7e3ff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: '0', color: '#5a2d82' }}>
                <strong>Medical Emergency or Family Emergency:</strong> Full refund may be considered with proper documentation.
              </p>
            </div>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Medical certificate required for health-related cancellations</li>
              <li>Police report or official documentation for other emergencies</li>
              <li>Emergency cancellations reviewed case-by-case</li>
              <li>Proof must be submitted within 48 hours of missed session</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#fd7e14', marginBottom: '15px', fontSize: '20px' }}>🌧️ Weather & Technical Issues</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Severe Weather:</strong> Full refund or free rescheduling if studio is inaccessible</li>
              <li><strong>Power Outage:</strong> Full refund or rescheduling if lasting more than 30 minutes</li>
              <li><strong>Equipment Failure:</strong> Full refund or rescheduling if session cannot proceed</li>
              <li><strong>Internet Issues:</strong> Partial refund if affecting live streaming/recording</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#20c997', marginBottom: '15px', fontSize: '20px' }}>📋 Refund Process</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>Submit Request:</strong> Email niyatstudios@gmail.com or call +91 8882379649</li>
              <li><strong>Provide Details:</strong> Booking ID, reason for cancellation, preferred refund method</li>
              <li><strong>Review Period:</strong> 1-2 business days for request verification</li>
              <li><strong>Processing Time:</strong> 5-7 business days for approved refunds</li>
              <li><strong>Refund Method:</strong> Same payment method used for original booking</li>
            </ol>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#e83e8c', marginBottom: '15px', fontSize: '20px' }}>📞 How to Cancel or Reschedule</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ color: '#495057', margin: '0 0 15px 0' }}>Contact Methods:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#495057' }}>📧 Email</p>
                  <a href="mailto:niyatstudios@gmail.com" style={{ color: '#007bff', textDecoration: 'none' }}>
                    niyatstudios@gmail.com
                  </a>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#495057' }}>📱 Phone</p>
                  <a href="tel:+918882379649" style={{ color: '#007bff', textDecoration: 'none' }}>
                    +91 8882379649
                  </a>
                </div>
              </div>
              <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#6c757d', fontStyle: 'italic' }}>
                Include your booking confirmation number and preferred new date/time when contacting us.
              </p>
            </div>
          </section>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #007bff',
            marginTop: '30px'
          }}>
            <h4 style={{ color: '#007bff', margin: '0 0 10px 0' }}>📍 Studio Address</h4>
            <p style={{ margin: '0 0 15px 0', color: '#555' }}>
              H-1462, Ground Floor, Chittaranjan Park, New Delhi - 110019
            </p>
            
            <p style={{ 
              margin: '15px 0 0 0', 
              fontSize: '14px', 
              color: '#666',
              fontStyle: 'italic' 
            }}>
              By booking our studio, you acknowledge and agree to this refund and cancellation policy. 
              This policy is designed to be fair to both clients and studio operations.
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

export default RefundPolicy;