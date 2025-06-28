import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

interface GoogleCalendarAvailabilityProps {
  date: string;
  duration: number;
  onAvailabilityLoaded: (availableSlots: string[], busySlots: string[]) => void;
}

const GoogleCalendarAvailability: React.FC<GoogleCalendarAvailabilityProps> = ({
  date,
  duration,
  onAvailabilityLoaded
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isApiReady, setIsApiReady] = useState(false);

  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || 'demo_api_key';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  useEffect(() => {
    initializeGapi();
    
    // Fallback timeout in case initialization takes too long
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Google API initialization timeout, showing all slots as available');
        showAllSlotsAsAvailable();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isApiReady && date) {
      checkAvailability();
    } else if (date && !isApiReady && !isLoading) {
      // If API not ready but we have a date, show all slots
      showAllSlotsAsAvailable();
    }
  }, [date, duration, isApiReady]);

  const initializeGapi = async () => {
    console.log('🚀 Starting Google API initialization...');
    console.log('📋 Environment variables:', {
      CLIENT_ID: CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : 'MISSING',
      API_KEY: API_KEY ? `${API_KEY.substring(0, 20)}...` : 'MISSING',
      hasGapi: typeof gapi !== 'undefined'
    });

    try {
      // Check if API key is properly configured
      if (!API_KEY || API_KEY === 'demo_api_key' || API_KEY === 'get_from_google_cloud_console') {
        console.warn('⚠️ Google API key not configured properly:', API_KEY);
        console.log('📝 Fallback: Showing all slots as available');
        showAllSlotsAsAvailable();
        return;
      }

      console.log('🔄 Loading Google API auth2:client...');
      await new Promise<void>((resolve, reject) => {
        gapi.load('auth2:client', () => {
          console.log('✅ Google API auth2:client loaded successfully');
          resolve();
        }, (error: any) => {
          console.error('❌ Error loading Google API auth2:client:', error);
          reject(error);
        });
      });

      console.log('🔄 Initializing Google client...');
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });

      console.log('✅ Google API initialization successful!');
      setIsApiReady(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ DETAILED ERROR in Google API initialization:');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error result:', error?.result);
      console.error('Full error object:', error);
      console.error('Stack trace:', error?.stack);
      
      setError(`Google Calendar API error: ${error?.message || 'Unknown error'}`);
      console.log('📝 Fallback: Showing all slots due to error');
      showAllSlotsAsAvailable();
    }
  };

  const checkAvailability = async () => {
    console.log('📅 Starting availability check for date:', date);
    try {
      setIsLoading(true);
      setError('');

      // Check if user is signed in
      const authInstance = gapi.auth2.getAuthInstance();
      console.log('🔐 Auth instance status:', {
        exists: !!authInstance,
        isSignedIn: authInstance?.isSignedIn?.get(),
        currentUser: authInstance?.currentUser?.get()?.getBasicProfile()?.getEmail()
      });

      if (!authInstance.isSignedIn.get()) {
        console.log('⚠️ User not signed in, showing all slots as available');
        showAllSlotsAsAvailable();
        return;
      }

      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);
      
      console.log('🔄 Fetching calendar events...', {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      });

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      console.log('📊 Calendar API response:', {
        status: response.status,
        itemCount: response.result.items?.length || 0,
        events: response.result.items?.map(e => ({
          summary: e.summary,
          start: e.start?.dateTime,
          end: e.end?.dateTime
        }))
      });

      const events = response.result.items || [];
      const busySlots = extractBusySlots(events);
      const allSlots = generateAllSlots();
      const availableSlots = filterAvailableSlots(allSlots, busySlots, duration);

      console.log('✅ Availability calculation complete:', {
        totalSlots: allSlots.length,
        busySlots: busySlots,
        availableSlots: availableSlots
      });

      onAvailabilityLoaded(availableSlots, busySlots);
    } catch (error: any) {
      console.error('❌ DETAILED ERROR in availability check:');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error result:', error?.result);
      console.error('Full error object:', error);
      console.error('Stack trace:', error?.stack);
      
      setError(`Calendar fetch error: ${error?.message || 'Unknown error'}`);
      console.log('📝 Fallback: Showing all slots due to fetch error');
      showAllSlotsAsAvailable();
    } finally {
      setIsLoading(false);
    }
  };

  const extractBusySlots = (events: any[]): string[] => {
    const busySlots: string[] = [];
    
    events.forEach(event => {
      if (event.start?.dateTime && event.end?.dateTime) {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        
        // Generate hourly slots for the duration of the event
        const current = new Date(startTime);
        while (current < endTime) {
          const hourSlot = current.getHours().toString().padStart(2, '0') + ':00';
          busySlots.push(hourSlot);
          current.setHours(current.getHours() + 1);
        }
      }
    });

    return [...new Set(busySlots)]; // Remove duplicates
  };

  const generateAllSlots = (): string[] => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const filterAvailableSlots = (allSlots: string[], busySlots: string[], duration: number): string[] => {
    return allSlots.filter(slot => {
      const startHour = parseInt(slot.split(':')[0]);
      const endHour = startHour + duration;
      
      // Check if booking would end after business hours
      if (endHour > 21) return false;
      
      // Check if any of the required consecutive hours are busy
      for (let i = 0; i < duration; i++) {
        const checkHour = startHour + i;
        const checkSlot = `${checkHour.toString().padStart(2, '0')}:00`;
        if (busySlots.includes(checkSlot)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const showAllSlotsAsAvailable = () => {
    const allSlots = generateAllSlots();
    const availableSlots = filterAvailableSlots(allSlots, [], duration);
    onAvailabilityLoaded(availableSlots, []);
    setIsLoading(false);
    setError(''); // Clear any previous errors
  };

  const signInToGoogle = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      checkAvailability();
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in to Google Calendar');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '20px', marginBottom: '10px' }}>📅</div>
        <p>Checking calendar availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '15px', 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0', color: '#856404' }}>
          <strong>⚠️ Calendar sync unavailable:</strong> {error}
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#856404' }}>
          Showing all time slots as available. Please check manually for conflicts.
        </p>
      </div>
    );
  }

  // Check if user needs to sign in
  const authInstance = gapi.auth2?.getAuthInstance();
  if (authInstance && !authInstance.isSignedIn.get()) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#e7f3ff', 
        border: '1px solid #b8daff',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔗</div>
        <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>Connect to Google Calendar</h4>
        <p style={{ margin: '0 0 15px 0', color: '#004085' }}>
          Sign in to see real-time availability from your Google Calendar (like Calendly)
        </p>
        <button
          onClick={signInToGoogle}
          style={{
            background: '#4285f4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔐 Sign in to Google Calendar
        </button>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
          This will show only truly available time slots based on your existing calendar events
        </p>
      </div>
    );
  }

  return null; // Component handles availability loading in the background
};

export default GoogleCalendarAvailability;