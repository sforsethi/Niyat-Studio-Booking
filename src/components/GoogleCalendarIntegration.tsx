import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

interface GoogleCalendarIntegrationProps {
  bookingData: {
    name: string;
    email: string;
    date: string;
    startTime: string;
    duration: number;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  bookingData,
  onSuccess,
  onError
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = 'your_api_key_here'; // You'd need to get this from Google Cloud Console
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

  useEffect(() => {
    initializeGapi();
  }, []);

  const initializeGapi = async () => {
    try {
      await gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: CLIENT_ID,
        });
      });
      
      const authInstance = gapi.auth2.getAuthInstance();
      setIsSignedIn(authInstance.isSignedIn.get());
    } catch (error) {
      console.error('Error initializing Google API:', error);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsSignedIn(true);
    } catch (error) {
      console.error('Error signing in:', error);
      onError?.('Failed to sign in to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const createCalendarEvent = async () => {
    try {
      setIsLoading(true);
      
      const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (bookingData.duration * 60 * 60 * 1000));

      const event = {
        summary: `Studio Booking - ${bookingData.name}`,
        description: `Studio booking for ${bookingData.name} (${bookingData.email})`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
      };

      await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating calendar event:', error);
      onError?.('Failed to create calendar event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
      <h4>📅 Add to Google Calendar</h4>
      {!isSignedIn ? (
        <div>
          <p>Sign in to automatically add this booking to your Google Calendar</p>
          <button 
            onClick={signIn}
            disabled={isLoading}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Connecting...' : '🔗 Connect Google Calendar'}
          </button>
        </div>
      ) : (
        <div>
          <p>✅ Connected to Google Calendar</p>
          <button 
            onClick={createCalendarEvent}
            disabled={isLoading}
            style={{
              background: '#34a853',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Adding to Calendar...' : '📅 Add Booking to Calendar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration;