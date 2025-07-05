import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
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
            🔒 Privacy Policy
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            margin: 0
          }}>
            Niyat Studios - Your Privacy Matters
          </p>
        </div>

        <div style={{ 
          color: '#333',
          lineHeight: '1.6',
          fontSize: '15px'
        }}>

          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0', color: '#2d5a2d', fontSize: '14px' }}>
              <strong>Last Updated:</strong> December 2024<br />
              This Privacy Policy explains how Niyat Studios collects, uses, and protects your personal information 
              when you use our studio booking services.
            </p>
          </div>
          
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>1. Information We Collect</h3>
            
            <h4 style={{ color: '#495057', marginBottom: '10px' }}>Personal Information</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Name, email address, and phone number</li>
              <li>Billing address for payment processing</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Booking preferences and history</li>
            </ul>

            <h4 style={{ color: '#495057', marginBottom: '10px' }}>Automatically Collected Information</h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Website usage analytics and cookies</li>
              <li>Booking timestamps and session data</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>2. How We Use Your Information</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Booking Management:</strong> Process reservations and manage your studio sessions</li>
              <li><strong>Communication:</strong> Send booking confirmations, reminders, and important updates</li>
              <li><strong>Payment Processing:</strong> Handle secure transactions through our payment gateway</li>
              <li><strong>Customer Support:</strong> Respond to inquiries and resolve booking issues</li>
              <li><strong>Service Improvement:</strong> Analyze usage patterns to enhance our offerings</li>
              <li><strong>Legal Compliance:</strong> Meet regulatory requirements and maintain business records</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>3. Information Sharing</h3>
            
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: '4px solid #ffc107'
            }}>
              <p style={{ margin: '0', color: '#856404' }}>
                <strong>We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.</strong>
              </p>
            </div>

            <h4 style={{ color: '#495057', marginBottom: '10px' }}>We may share information only with:</h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Payment Processors:</strong> Razorpay for secure payment handling</li>
              <li><strong>Service Providers:</strong> Third-party tools for booking management and analytics</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfer:</strong> In case of merger, acquisition, or asset sale</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>4. Data Security</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>SSL encryption for all data transmission</li>
              <li>Secure servers with regular security updates</li>
              <li>Access controls limiting who can view your information</li>
              <li>Regular security audits and monitoring</li>
              <li>Payment data processed through PCI-compliant systems</li>
              <li>Secure backup and recovery procedures</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>5. Cookies and Tracking</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Essential Cookies:</strong> Required for booking functionality and security</li>
              <li><strong>Analytics Cookies:</strong> Help us understand website usage and improve services</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and booking preferences</li>
              <li><strong>Third-party Cookies:</strong> Payment processing and integrated services</li>
            </ul>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '10px'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                You can control cookies through your browser settings, but disabling essential cookies may affect booking functionality.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>6. Data Retention</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Booking Records:</strong> Retained for 3 years for accounting and legal purposes</li>
              <li><strong>Payment Information:</strong> Processed and stored by Razorpay per their retention policy</li>
              <li><strong>Communication Records:</strong> Email and support communications kept for 2 years</li>
              <li><strong>Analytics Data:</strong> Anonymized usage data retained for service improvement</li>
              <li><strong>Account Deletion:</strong> Personal data deleted within 30 days of account closure request</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>7. Your Rights</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px'
            }}>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Access:</strong> Request a copy of your personal data we hold
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Correction:</strong> Update or correct inaccurate personal information
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Portability:</strong> Receive your data in a structured, machine-readable format
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Objection:</strong> Object to processing of your data for specific purposes
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>8. Third-Party Services</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Razorpay:</strong> Payment processing - governed by Razorpay's privacy policy</li>
              <li><strong>Google Calendar:</strong> Booking integration - subject to Google's privacy terms</li>
              <li><strong>Analytics Tools:</strong> Website performance monitoring</li>
              <li><strong>Email Services:</strong> Booking confirmations and communications</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>9. Children's Privacy</h3>
            <p style={{ paddingLeft: '20px', margin: '0' }}>
              Our services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information from 
              a child under 13, please contact us immediately.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>10. Changes to Privacy Policy</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>We may update this privacy policy periodically</li>
              <li>Changes will be posted on our website with updated date</li>
              <li>Significant changes will be communicated via email</li>
              <li>Continued use constitutes acceptance of updated policy</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>11. Contact Us</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ color: '#495057', margin: '0 0 15px 0' }}>Privacy-Related Inquiries:</h4>
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
              <div style={{ marginTop: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#495057' }}>📍 Address</p>
                <p style={{ margin: '0', color: '#555' }}>
                  H-1462, Ground Floor, Chittaranjan Park, New Delhi - 110019
                </p>
              </div>
            </div>
          </section>

          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #007bff',
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#1565c0',
              fontWeight: 'bold'
            }}>
              Your privacy is important to us. We are committed to protecting your personal information 
              and being transparent about our data practices.
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

export default PrivacyPolicy;