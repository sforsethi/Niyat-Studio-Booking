import React from 'react';

interface ContactUsProps {
  onClose: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onClose }) => {
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
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
            fontSize: '24px',
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
            📞 Contact Us
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            margin: 0
          }}>
            Get in touch with Niyat Studios
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '25px' 
        }}>
          {/* Phone */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              fontSize: '24px',
              marginRight: '15px',
              minWidth: '40px'
            }}>
              📱
            </div>
            <div>
              <h4 style={{ 
                margin: '0 0 5px 0', 
                color: '#333',
                fontSize: '16px'
              }}>
                Phone
              </h4>
              <a 
                href="tel:+918882379649"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                +91 8882379649
              </a>
            </div>
          </div>

          {/* Email */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              fontSize: '24px',
              marginRight: '15px',
              minWidth: '40px'
            }}>
              ✉️
            </div>
            <div>
              <h4 style={{ 
                margin: '0 0 5px 0', 
                color: '#333',
                fontSize: '16px'
              }}>
                Email
              </h4>
              <a 
                href="mailto:niyatstudios@gmail.com"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                niyatstudios@gmail.com
              </a>
            </div>
          </div>

          {/* Address */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              fontSize: '24px',
              marginRight: '15px',
              minWidth: '40px',
              marginTop: '2px'
            }}>
              📍
            </div>
            <div>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                color: '#333',
                fontSize: '16px'
              }}>
                Studio Address
              </h4>
              <p style={{
                margin: 0,
                color: '#555',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                H-1462, Ground Floor<br />
                Chittaranjan Park<br />
                New Delhi - 110019
              </p>
              <a
                href="https://maps.app.goo.gl/jCD5mJ9QvnsPfr9V8"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                📍 View on Google Maps
              </a>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '10px'
        }}>
          <p style={{
            margin: '0 0 10px 0',
            color: '#1976d2',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🎵 Complete Solution Studio
          </p>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            🌺 Influencer shoots • 🌺 Dance & Fitness classes<br />
            🌺 Videography • 🌺 And much more
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;