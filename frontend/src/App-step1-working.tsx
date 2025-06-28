import React from 'react';
import Calendar from './components/Calendar';
import './App.css';

function App() {
  const handleDateSelect = (date: string) => {
    alert(`Selected date: ${date}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Studio Booking System</h1>
        <p>Book your studio time at ₹950 per hour</p>
      </header>
      <main>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Step 1: Select a Date</h2>
          <Calendar onDateSelect={handleDateSelect} />
        </div>
      </main>
    </div>
  );
}

export default App;