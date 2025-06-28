# Google Calendar API Setup Guide

## Current Status
✅ **Client ID**: 931846062684-qekghuf4aibk889q81gar0g6eqjtqvdm.apps.googleusercontent.com

## Required Steps

### 1. Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create new one
3. **Enable Google Calendar API**:
   - Navigate to APIs & Services → Library
   - Search "Google Calendar API" 
   - Click "Enable"

4. **Create Service Account**:
   - APIs & Services → Credentials
   - Click "Create Credentials" → "Service Account"
   - Name: `studio-booking-service`
   - Role: `Project → Editor`

5. **Generate JSON Key**:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Download the file

### 2. Extract Credentials from JSON
From the downloaded JSON file, find these values:
```json
{
  "client_email": "studio-booking-service@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
}
```

### 3. Update Environment Variables
Edit `backend/.env` and replace:
```env
GOOGLE_CLIENT_EMAIL=studio-booking-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

### 4. Share Calendar with Service Account
1. Open Google Calendar
2. Go to Settings → Calendars
3. Select your calendar → "Share with specific people"
4. Add the service account email with "Make changes to events" permission

### 5. Get Calendar ID (Optional)
- In Google Calendar settings, find "Calendar ID"
- Replace `primary` in .env with actual calendar ID if needed

## Testing
Once configured, restart the backend server:
```bash
cd backend
npm start
```

The system will automatically:
- ✅ Check Google Calendar for availability
- ✅ Create calendar events for confirmed bookings
- ✅ Sync booking status

## Alternative: Simplified Setup
If you prefer to skip Google Calendar integration for now:
1. The booking system works perfectly without it
2. All bookings are stored in SQLite database
3. You can manually add events to Google Calendar

Your studio booking system is fully functional even without Google Calendar API!