import React from 'react';
import BookingSystem from './components/BookingSystem';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Studio Booking System</h1>
        <p>Book your studio time at ₹950 per hour</p>
      </header>
      <main>
        <BookingSystem />
      </main>
    </div>
  );
}

export default App
