import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Studio Booking System</h1>
        <p>Book your studio time at ₹950 per hour</p>
      </header>
      <main>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>🎵 Welcome to Studio Booking!</h2>
          <p>This is a test to verify the React app is working.</p>
          <button 
            style={{ 
              background: '#667eea', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            onClick={() => alert('React is working!')}
          >
            Test Button - Click Me!
          </button>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Backend Status:</strong> Testing connection...</p>
            <button 
              style={{ 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5001/api/availability/2024-12-25');
                  const data = await response.json();
                  alert('Backend connected! Available slots: ' + data.availableSlots.length);
                } catch (error) {
                  alert('Backend connection failed: ' + error);
                }
              }}
            >
              Test Backend Connection
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;